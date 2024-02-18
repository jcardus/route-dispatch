import Avatar, { InitialsProviding } from './Avatar'

const UserLabel = ({ initialsProviding }: { initialsProviding: InitialsProviding }) => (
    <div className="flex items-center">
        <div className="mr-1">
            <Avatar initialsProviding={initialsProviding} size="small" />
        </div>
        <div>{`${initialsProviding.given_name} ${initialsProviding.family_name}`}</div>
    </div>
)

export default UserLabel
