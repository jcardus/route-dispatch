import { useCallback, useState } from 'react'
import { CSVLink } from 'react-csv'
import { useDropzone } from 'react-dropzone'
import { Helmet } from 'react-helmet'
import { useHistory } from 'react-router'
import { useDataContext } from '../components/context/DataContextProvider'
import ImportSmallIcon from '../components/icons/ImportSmallIcon'
import Modal from '../components/Modal'
import { track } from '../modules/apis/segment'

const SAMPLE_CSV_DATA = [
    ['Unit No', 'Street Address', 'City', 'State', 'Postal Code', 'Package Count', 'Instruction Text'],
    [null, '2010 SW CARTER LN', 'Portland', 'OR', '97201-2411', 2, null],
    [null, '1919 SW MONTGOMERY PL', 'Portland', 'OR', '97201-2446', null, null],
    ['123', '1925 SW VISTA AVE', 'Portland', 'OR', '97201-2454', null, 'Instructing on how to deliver']
]

const ImportRoutePage = () => {
    const [errorMessage, setErrorMessage] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const { importRoute } = useDataContext()
    const history = useHistory()

    const onDropAccepted = useCallback(
        async (files: string | any[]) => {
            if (files.length === 0) {
                return
            }

            setIsUploading(true)
            const file = files[files.length - 1]
            const reader = new FileReader()
            reader.addEventListener(
                'load',
                async function () {
                    try {
                        // Calling `readAsDataUrl` on reader will give us a string type for
                        // the result prop: https://developer.mozilla.org/en-US/docs/Web/API/FileReader/result
                        const dataUrl = reader.result as string | null
                        if (!dataUrl) {
                            throw new Error('Could not read data from file')
                        }

                        const response = await importRoute(dataUrl.split(',')[1])
                        track('Route Route Created', {
                            route_id: response.id,
                            source: 'Spreadsheet',
                            stops: response.stops,
                            stops_added_count: response.stops ? response.stops.length : null
                        })
                        history.push(`/routes/${response.id}`)
                    } catch {
                        setErrorMessage(true)
                    } finally {
                        setIsUploading(false)
                    }
                },
                false
            )
            reader.readAsDataURL(file)
        },
        [importRoute, history]
    )


    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        // @ts-ignore
        accept: '.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel',
        onDropAccepted
    })

    const borderClass = isDragActive ? 'border-2 rounded border-blue' : ''

    return (
        <Modal expandedOnLoad onClose={() => history.goBack()}>
            <Helmet title="Import Route | Fleetmap Route Dispatch"></Helmet>
            <div className="w-96">
                <h1 className="heading-2 mb-2">Import a route</h1>
                <div className="flex justify-between mb-2">
                    <p className="text-gray text-left">We support CSV & Excel files</p>
                    <CSVLink
                        className="text-blue text-right"
                        data={SAMPLE_CSV_DATA}
                        filename="sample_manifest.csv"
                        target="_blank"
                    >
                        Download
                    </CSVLink>
                </div>
                <div className="bg-blue-lighter relative border-2 rounded border-gray-light border-dashed">
                    {!isUploading ? (
                        <div
                            {...getRootProps({
                                className: `dropzone h-60 ${borderClass}`
                            })}
                        >
                            <input {...getInputProps()} />
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center">
                                <p className="heading-3 mb-1">Drag and drop file here</p>
                                <p className="underline text-sm">Or browse your computer...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-60">
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center flex items-center text-blue">
                                <ImportSmallIcon />
                                <div className="heading-3 ml-1">Uploading...</div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="pt-4 text-center">
                    <button className="button-light" disabled={isUploading} onClick={() => history.goBack()}>
                        Cancel
                    </button>
                </div>
                {errorMessage && (
                    <div className="mt-4 text-red">
                        There was an error uploading your file. Please check the format and try again.
                    </div>
                )}
            </div>
        </Modal>
    )
}

export default ImportRoutePage
