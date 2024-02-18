import FedexCircle from './icons/FedexCircle'

const FedexLabel = ({ name }: { name: string }) => (
    <div className="flex items-center">
        <FedexCircle />
        <div className="ml-2">{name}</div>
    </div>
)

export default FedexLabel
