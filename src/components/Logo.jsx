import React from 'react';

const Logo = ({ size = 40, color = "var(--primary)", textColor = "#1D1D1F", showText = true, layout = "horizontal", className = "" }) => {
  const symbolWidth = size;
  const symbolHeight = size;

  const symbol = (
    <svg
      width={symbolWidth}
      height={symbolHeight}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="logo-symbol"
    >
      {/* Top Chevron */}
      <path d="M15 38L50 20L85 38V48L50 30L15 48V38Z" fill={color} />

      {/* Middle Chevron with 'P' shape */}
      <path d="M15 63L50 45L85 63V85H72V68L50 56L15 73V63Z" fill={color} />

      {/* Bottom Chevron */}
      <path d="M15 88L50 70L85 88V98L50 80L15 98V88Z" fill={color} />
    </svg>
  );

  // Se showText for false e a logo foi removida, podemos retornar nulo ou uma versão simplificada
  if (!showText) return null;

  return (
    <div className={`logo-container ${layout} ${className}`} style={{ height: size }}>
      {/* {symbol} - Logo removida conforme solicitado */}
      <div className="logo-text-group">
        <h1 className="logo-main-text" style={{ color: textColor }}>PEDROSA</h1>
        <p className="logo-sub-text" style={{ color: textColor }}>CONSTRUTORA E INCORPORADORA</p>
      </div>

      <style jsx>{`
        .logo-container {
          display: flex;
          align-items: center;
          gap: 0;
          user-select: none;
        }
        
        .logo-container.vertical {
          flex-direction: column;
          height: auto !important;
          text-align: center;
          gap: 1rem;
        }

        .logo-text-group {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
          justify-content: center;
        }

        .logo-main-text {
          font-family: 'Michroma', sans-serif;
          font-weight: 400;
          font-size: calc(${size}px * 0.7);
          letter-spacing: 0.1em;
          margin: 0;
          padding: 0;
          margin-top: -4px;
        }

        .logo-sub-text {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: calc(${size}px * 0.17);
          letter-spacing: 0.28em;
          margin: 0;
          padding: 0;
          margin-top: 2px;
          opacity: 1;
          white-space: nowrap;
        }

        .vertical .logo-main-text {
          font-size: calc(${size}px * 0.6);
        }
        
        .vertical .logo-sub-text {
          font-size: calc(${size}px * 0.15);
        }
      `}</style>
    </div>
  );
};

export default Logo;
