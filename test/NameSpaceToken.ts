import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect, assert } from "chai";
import hre from "hardhat";

describe("NameSpace", function () {
  const initialShortPenalty = 1_000_000;
  const initialLongPenalty = 50;
  const initialAmount = 1_000_000_000;

  async function deployNameSpaceToken() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const NameSpaceToken = await hre.ethers.getContractFactory(
      "NameSpaceToken"
    );

    const nameSpaceToken = await NameSpaceToken.deploy(initialAmount);

    await nameSpaceToken.waitForDeployment();

    return { nameSpaceToken, owner, otherAccount };
  }

  describe("Deployment of token", function () {
    it("Should set the right owner", async function () {
      const { nameSpaceToken, owner } = await loadFixture(deployNameSpaceToken);
      const ownerBalance = await nameSpaceToken.balanceOf(owner.address);
      console.log("owner balance: ", ownerBalance);
      console.log("owner address: ", owner.address);

      expect(ownerBalance / BigInt(1e18)).to.equal(initialAmount);
      expect(await nameSpaceToken.owner()).to.equal(owner.address);
    });
  });

  async function deployNameSpaceNFT() {
    const { nameSpaceToken, owner, otherAccount } = await loadFixture(
      deployNameSpaceToken
    );

    const tokenAddr = await nameSpaceToken.getAddress();

    const NameSpaceNFT = await hre.ethers.getContractFactory("NameSpaceNFT");
    const nameSpaceNFT = await NameSpaceNFT.deploy(
      tokenAddr,
      initialShortPenalty,
      initialLongPenalty
    );

    return { nameSpaceNFT, owner, otherAccount, tokenAddr, nameSpaceToken };
  }

  describe("Deployment of NFT", function () {
    it("Token address of NFT is same as token address", async function () {
      const { nameSpaceNFT, tokenAddr } = await loadFixture(deployNameSpaceNFT);

      expect(await nameSpaceNFT.tokenAddress()).to.equal(tokenAddr);
    });
  });

  async function setNftAddressInToken() {
    const { nameSpaceNFT, nameSpaceToken, owner, otherAccount } =
      await loadFixture(deployNameSpaceNFT);

    const nftAddress = await nameSpaceNFT.getAddress();
    const tokenAddress = await nameSpaceToken.getAddress();

    await nameSpaceToken.setNFTAddress(nftAddress);

    console.log("namespace token nft address: ", nftAddress);
    console.log("namespace token address: ", tokenAddress);

    const mockURI =
      "https://ipfs.io/ipfs/bafybeibulyuw4qmptj3z4kujjh2w5677xx3eizwydz2yao3nnrt7fhsnlq/1000.json";

    return {
      nameSpaceNFT,
      owner,
      otherAccount,
      nameSpaceToken,
      nftAddress,
      mockURI,
    };
  }

  describe("Set NFT's address in token", function () {
    it("Token address of NFT is same as token address", async function () {
      const { nameSpaceToken, nftAddress } = await loadFixture(
        setNftAddressInToken
      );

      expect(await nameSpaceToken.nftAddress()).to.equal(nftAddress);
    });

    it("Can only set NFT address once", async function () {
      const { nameSpaceToken, nftAddress } = await loadFixture(
        setNftAddressInToken
      );

      const NameSpaceToken = await hre.ethers.getContractFactory(
        "NameSpaceToken"
      );

      // Assert that minting with the same string value reverts
      await expect(
        nameSpaceToken.setNFTAddress(nftAddress)
      ).to.be.revertedWithCustomError(NameSpaceToken, "NftAlreadySet");
    });
  });

  async function mintNFT() {
    const { nameSpaceNFT, nameSpaceToken, owner, otherAccount, mockURI } =
      await loadFixture(setNftAddressInToken);

    const stringToBeMinted = "Hello World!";

    await nameSpaceNFT.mintNFT(owner.address, stringToBeMinted, mockURI);

    return {
      nameSpaceNFT,
      owner,
      otherAccount,
      nameSpaceToken,
      stringToBeMinted,
      mockURI,
    };
  }

  async function mintNFTWithoutTokens() {
    const { nameSpaceNFT, nameSpaceToken, owner, otherAccount, mockURI } =
      await loadFixture(setNftAddressInToken);

    const stringToBeMinted = "Hello World!";

    return {
      nameSpaceNFT,
      owner,
      otherAccount,
      nameSpaceToken,
      stringToBeMinted,
      mockURI,
    };
  }

  async function tokenDecreasedAfterMinting() {
    const { nameSpaceNFT, nameSpaceToken, owner, otherAccount } =
      await loadFixture(mintNFT);

    return { nameSpaceNFT, owner, otherAccount, nameSpaceToken };
  }

  async function mintShortNFTComparison() {
    const { nameSpaceNFT, nameSpaceToken, owner, otherAccount, mockURI } =
      await loadFixture(setNftAddressInToken);

    return {
      nameSpaceNFT,
      owner,
      otherAccount,
      nameSpaceToken,
      mockURI,
    };
  }

  describe("Mint NFT", function () {
    it("Owner can mint the first nft", async function () {
      const { nameSpaceNFT, stringToBeMinted } = await loadFixture(mintNFT);

      const stringMinted = await nameSpaceNFT.getTokenMetas(1);

      expect(stringMinted).to.equal(stringToBeMinted);
      const newlyMinted = 1;
      expect(await nameSpaceNFT.getTokenId()).to.equal(newlyMinted + 1);
    });

    it("NFT isAvailable should return false after exact string being minted", async function () {
      const { nameSpaceNFT, stringToBeMinted } = await loadFixture(mintNFT);

      const isAvailable = await nameSpaceNFT.isAvailable(stringToBeMinted);
      expect(isAvailable).to.equal(false);
    });

    it("Token decrease after minting", async function () {
      const { nameSpaceToken, owner } = await loadFixture(
        tokenDecreasedAfterMinting
      );
      const finalTokenCount = await nameSpaceToken.balanceOf(owner.address);

      expect(Number(finalTokenCount) / 1e18).to.be.lessThan(initialAmount);
    });

    it("Cannot mint NFT if not enough tokens", async function () {
      const { stringToBeMinted, nameSpaceNFT, otherAccount, mockURI } =
        await loadFixture(mintNFTWithoutTokens);

      const NameSpaceNFT = await hre.ethers.getContractFactory("NameSpaceNFT");

      await expect(
        nameSpaceNFT.mintNFT(otherAccount.address, stringToBeMinted, mockURI)
      ).to.be.revertedWithCustomError(NameSpaceNFT, "NotEnoughTokens");
    });

    it("Pricier tokens for shorter strings when string is less than", async function () {
      let { nameSpaceNFT, nameSpaceToken, owner, mockURI } = await loadFixture(
        mintShortNFTComparison
      );

      const fiveCharStringToBeMinted = "Hello";

      await nameSpaceNFT.mintNFT(
        owner.address,
        fiveCharStringToBeMinted,
        mockURI
      );
      const fiveCharStringTokenCount = await nameSpaceToken.balanceOf(
        owner.address
      );

      ({ nameSpaceNFT, nameSpaceToken, owner } = await loadFixture(
        mintShortNFTComparison
      ));

      const sixCharStringToBeMinted = "Hello!";

      await nameSpaceNFT.mintNFT(
        owner.address,
        sixCharStringToBeMinted,
        mockURI
      );
      const sixCharStringTokenCount = await nameSpaceToken.balanceOf(
        owner.address
      );

      expect(sixCharStringTokenCount).to.be.lessThan(fiveCharStringTokenCount);
    });
  });

  async function mintNFTTwice() {
    const { nameSpaceNFT, nameSpaceToken, owner, otherAccount, mockURI } =
      await loadFixture(mintNFT);

    return { nameSpaceNFT, owner, otherAccount, nameSpaceToken, mockURI };
  }

  describe("Cannot mint NFT with same string value", function () {
    it("Owner mint nft twice", async function () {
      const { nameSpaceNFT, owner, mockURI } = await loadFixture(mintNFTTwice);

      const NameSpaceNFT = await hre.ethers.getContractFactory("NameSpaceNFT");

      await nameSpaceNFT.mintNFT(owner.address, "Hello World!!", mockURI);

      // Assert that minting with the same string value reverts
      await expect(
        nameSpaceNFT.mintNFT(owner.address, "Hello World!!", mockURI)
      ).to.be.revertedWithCustomError(NameSpaceNFT, "NameSpaceUsed");
    });
  });
});
