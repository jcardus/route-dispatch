export const getStopFromGeocode = (result) => {
    const stop = {
        title: result.text,
        place_name: result.place_name,
        location: {
            lat: result.center[1],
            lon: result.center[0]
        }
    }

    if (result.context && result.context.length) {
        stop.address_parsed = {}
        for (const { id, short_code, text } of result.context) {
            if (id?.startsWith('country')) {
                stop.address_parsed.country = text
                stop.address_parsed.country_code = short_code
            }

            if (id?.startsWith('region')) {
                stop.address_parsed.state = text
            }

            if (id?.startsWith('postcode')) {
                stop.address_parsed.postal_code = text
            }

            if (id?.startsWith('place')) {
                stop.address_parsed.city = text
            }

            if (id?.startsWith('district')) {
                stop.address_parsed.district = text
            }
        }
    }

    return stop
}
