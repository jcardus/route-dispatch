import { Link } from 'react-router-dom'

const LargeLink = ({ icon, text, href, onClick }) => (
    <Link
        to={href}
        onClick={() => {
            if (onClick) {
                onClick()
            }
        }}
    >
        <div className="w-35 h-42 px-1 py-4 rounded border border-gray-lighter text-center">
            <div className="inline-block h-12 mb-1 flex flex-col items-center justify-center">{icon}</div>
            <div className="px-2">{text}</div>
        </div>
    </Link>
)

export default LargeLink
