export function EyeMark({ seeing = false }: { seeing?: boolean }) {
  return (
    <svg
      viewBox="0 0 140 84"
      className={`eye-mark h-[4.5rem] w-36 text-brass${seeing ? " is-seeing" : ""}`}
      aria-hidden="true"
    >
      <defs>
        <clipPath id="eye-socket">
          <path d="M8 44c20-24 104-24 124 0-20 24-104 24-124 0z" />
        </clipPath>
        <filter id="eye-glow" x="-60%" y="-120%" width="220%" height="340%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <g className="eye-float">
        <ellipse className="eye-glow fill-brass" cx="70" cy="44" rx="38" ry="17" filter="url(#eye-glow)" />
        <g className="eye-rays" stroke="currentColor" fill="none" strokeWidth="0.7">
          <path d="M70 8v10" />
          <path d="M70 70v8" />
          <path d="M22 20l7 7" />
          <path d="M118 20l-7 7" />
          <path d="M14 44h8" />
          <path d="M118 44h8" />
        </g>
        <path
          d="M8 44c20-24 104-24 124 0-20 24-104 24-124 0z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.35"
        />
        <g clipPath="url(#eye-socket)">
          <path d="M8 44c20-24 104-24 124 0-20 24-104 24-124 0z" className="fill-void" />
          <g className="eye-glance">
            <circle cx="70" cy="44" r="15.5" fill="none" stroke="currentColor" strokeWidth="1.15" />
            <circle cx="70" cy="44" r="9.5" fill="none" stroke="currentColor" strokeWidth="0.55" opacity="0.7" />
            <circle cx="70" cy="44" r="4.3" className="pupil fill-bone" />
            <circle cx="73.4" cy="41.2" r="1.35" className="fill-void" />
          </g>
          <g className="lid-top">
            <rect x="0" y="16" width="140" height="28" className="fill-void" />
            <path d="M18 43.2h104" fill="none" stroke="currentColor" strokeWidth="1.15" />
          </g>
          <g className="lid-bottom">
            <rect x="0" y="44" width="140" height="28" className="fill-void" />
            <path d="M18 44.8h104" fill="none" stroke="currentColor" strokeWidth="1.15" />
          </g>
        </g>
        <path
          d="M24 44c14-12 78-12 92 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.55"
          opacity="0.4"
        />
      </g>
    </svg>
  );
}
