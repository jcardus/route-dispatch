/**
 * Rounds a number to a certain floating point precision
 * @param number input value to be rounded
 * @param decimalPlaces floating point precision to round
 * @returns Rounded value
 */
export const round = (number: number, decimalPlaces: number) => {
    const factorOfTen = Math.pow(10, decimalPlaces)
    return Math.round(number * factorOfTen) / factorOfTen
}
