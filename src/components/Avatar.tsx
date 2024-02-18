import AvatarCircle from './icons/AvatarCircle'

export interface InitialsProviding {
    given_name: string
    family_name: string
}
const Avatar = ({
    initialsProviding,
    size
}: {
    initialsProviding: InitialsProviding
    size: 'large' | 'medium' | 'small'
}) => {
    let initials = 'XX'
    if (initialsProviding.given_name && initialsProviding.family_name) {
        initials = `${initialsProviding.given_name.charAt(0)}${initialsProviding.family_name.charAt(0)}`
    }

    let sizeClass
    let textClass
    switch (size) {
        case 'large':
            sizeClass = 'h-18 w-18'
            textClass = 'text-xl'
            break
        case 'medium':
            sizeClass = 'h-10 w-10'
            textClass = 'text-sm'
            break
        case 'small':
        default:
            sizeClass = 'h-7 w-7'
            textClass = 'text-xs'
            break
    }

    return (
        <div className="relative">
            <AvatarCircle className={`inline-block text-blue ${sizeClass}`} />
            <div
                className={`absolute text-white ${textClass} font-semibold top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
            >
                {initials}
            </div>
        </div>
    )
}

export default Avatar
