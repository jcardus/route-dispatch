import { Stop } from '../../types/Models'

export const getTimeWindowRange = (timeWindow: NonNullable<Stop['time_window']>): string => {
    const fromDate = new Date(timeWindow.from)
    const toDate = new Date(timeWindow.to)

    // Format at <hour>am/pm - <hour>am/pm. The default formatting is uppercased and has a space
    // between the number and am/pm so we apply formatting after
    const locale = 'en-US'
    const localeFormat: Intl.DateTimeFormatOptions = { hour: 'numeric', hour12: true }
    return `${fromDate.toLocaleString(locale, localeFormat).replace(' ', '')} - ${toDate
        .toLocaleString(locale, localeFormat)
        .replace(' ', '')}`.toLowerCase()
}
