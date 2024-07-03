export function convertUnixTimestampToGMTPlus8(unixTimestamp: number): Date {
  // Convert the Unix timestamp to milliseconds by multiplying by 1000
  const timestampInMilliseconds = unixTimestamp * 1000;

  // Create a Date object using the timestamp
  const date = new Date(timestampInMilliseconds);

  // Set the timezone offset to GMT+8 (480 minutes ahead of UTC)
  date.setMinutes(date.getMinutes() + 480);

  return date;
}

export function stringMatchAll(input: string, matchArr: string[]) {
  return matchArr.every((match) => input.includes(match));
}

export function stringMatchAny(input: string, matchArr: string[]) {
  return matchArr.some((match) => input.includes(match));
}

export function shortenAddress(address: string) {
  if (address.length < 42) {
    throw new Error("Invalid address length");
  }
  const start = address.substring(0, 7);
  const end = address.substring(address.length - 5);
  return `${start}...${end}`;
}

export function formatNumberWithCommas(
  number: number | string,
  decimalPlaces = 0
) {
  // Convert number to string if it's not already
  const numString =
    typeof number === "number" ? number.toFixed(decimalPlaces) : number;

  // Split the number into integer and decimal parts
  const parts = numString.split(".");
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? `.${parts[1]}` : "";

  // Add commas to the integer part
  const integerWithCommas = integerPart
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Return the formatted number
  return `${integerWithCommas}${decimalPart}`;
}

// Function to run a regular task on fixed intervals until a condition is met or a timeout is reached
export const pollWithInterval = async (
  fn: () => Promise<boolean>,
  interval: number,
  timeout: number
) => {
  const startTime = Date.now();
  while (true) {
    // If condition is met, return true and exit the loop
    if (await fn()) {
      return true;
    }
    // If timeout is reached, return false and exit the loop
    if (Date.now() - startTime > timeout) {
      return false;
    }
    // Wait for the specified interval before running the function again
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
};
