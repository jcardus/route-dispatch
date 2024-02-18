export const isToday = (date: Date): boolean => {
    const today = new Date()
    return areSameDay(today, date)
}

export const isYesterday = (date: Date): boolean => {
    const yesterday = new Date()
    //Subtract one day from it to get yesterday
    yesterday.setDate(yesterday.getDate() - 1)
    return areSameDay(yesterday, date)
}

const areSameDay = (lhs: Date, rhs: Date): boolean => {
    return (
        lhs.getDate() === rhs.getDate() && lhs.getMonth() === rhs.getMonth() && lhs.getFullYear() === rhs.getFullYear()
    )
}
