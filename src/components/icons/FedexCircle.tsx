const FedexCircle = () => (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_971_20826)">
            <rect x="3" y="3" width="24" height="24" rx="12" fill="#FF6D55" />
            <rect x="2.5" y="2.5" width="25" height="25" rx="12.5" stroke="white" />
        </g>
        <g clipPath="url(#clip0_971_20826)">
            <path
                d="M14.9998 9.66663V7.66663L12.3332 10.3333L14.9998 13V11C17.2065 11 18.9998 12.7933 18.9998 15C18.9998 15.6733 18.8332 16.3133 18.5332 16.8666L19.5065 17.84C20.0265 17.02 20.3332 16.0466 20.3332 15C20.3332 12.0533 17.9465 9.66663 14.9998 9.66663ZM14.9998 19C12.7932 19 10.9998 17.2066 10.9998 15C10.9998 14.3266 11.1665 13.6866 11.4665 13.1333L10.4932 12.16C9.97317 12.98 9.6665 13.9533 9.6665 15C9.6665 17.9466 12.0532 20.3333 14.9998 20.3333V22.3333L17.6665 19.6666L14.9998 17V19Z"
                fill="white"
            />
        </g>
        <defs>
            <filter
                id="filter0_d_971_20826"
                x="0"
                y="0"
                width="30"
                height="30"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
            >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                />
                <feMorphology radius="2" operator="dilate" in="SourceAlpha" result="effect1_dropShadow_971_20826" />
                <feOffset />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.427451 0 0 0 0 0.333333 0 0 0 0.3 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_971_20826" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_971_20826" result="shape" />
            </filter>
            <clipPath id="clip0_971_20826">
                <rect width="16" height="16" fill="white" transform="translate(7 7)" />
            </clipPath>
        </defs>
    </svg>
)

export default FedexCircle
