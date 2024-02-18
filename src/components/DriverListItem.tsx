import { ReactNode, useState } from 'react'
import { SpinnerCircular } from 'spinners-react'
import { Driver } from '../types/Models'
import { useDataContext } from './context/DataContextProvider'
import ExpandablePanel from './ExpandablePanel'
import DeleteIcon from './icons/DeleteIcon'
import { DriverStatusLabel } from './StatusLabels'

const DriverListItem = ({ driver, children }: { driver: Driver; children: ReactNode }) => {
    const { deleteDriver, getDriverStatus } = useDataContext()
    const [loading, setLoading] = useState(false)

    // Returns the
    const moreColumnContents = (): ReactNode => {
        if (loading) {
            return <SpinnerCircular color="blue" secondaryColor="#e0e0e0" size={20} thickness={200} />
        } else if (children) {
            return children
        } else {
            return (
                <ExpandablePanel
                    panelItems={[
                        {
                            icon: <DeleteIcon />,
                            title: 'Remove driver',
                            onClick: handleDelete,
                            color: 'red'
                        }
                    ]}
                />
            )
        }
    }

    const handleDelete = async () => {
        setLoading(true)
        await deleteDriver(driver.id)
        setLoading(false)
    }

    const driverStatus = getDriverStatus(driver)
    let joinedDriverName: string | undefined = [driver.given_name, driver.family_name].join(
        driver.given_name && driver.family_name ? ' ' : ''
    )
    if (joinedDriverName.length === 0) {
        joinedDriverName = undefined
    }

    const driverName = driver.name || joinedDriverName || driver.phone_number
    return (
        <tr className="border-b border-gray-lighter h-16 hover:bg-blue-light">
            <td className="pl-4">
                <span className="text-gray-dark font-semibold">{`${driverName}`}</span>
            </td>
            <td className="px-4">
                <DriverStatusLabel status={driverStatus} />
            </td>
            <td className="pr-10">{moreColumnContents()}</td>
        </tr>
    )
}

export default DriverListItem
