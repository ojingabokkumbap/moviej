export default function CirclePercentChart({
  percent = 65,
  color = "#7c3aed",
  size = 100,
  label,
}: {
  percent?: number; // 0~100
  color?: string; // 진행률 색상
  size?: number; // 차트 크기 (px)
  label?: string; // 중앙에 표시할 텍스트 (기본: percent%)
}) {
  // size에 따라 동적으로 계산
  const backgroundStrokeWidth = Math.max(size * 0.06, 4.5);
  const strokeWidth = Math.max(size * 0.08, 6); // 최소 6px, size에 따라 비례
  const radius = size / 2 - strokeWidth / 2;
  const normalizedRadius = radius;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        height={size}
        width={size}
        className="transform -rotate-90"
      >
        {/* 배경 원 */}
        <circle
          stroke="#DBD2E8"
          fill="transparent"
          strokeWidth={backgroundStrokeWidth}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* 진행률 원 */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          style={{
            transition: 'stroke-dasharray 0.5s ease-in-out',
          }}
        />
      </svg>
      {/* 중앙 텍스트 */}
      <div
        className="absolute inset-0 flex items-center justify-center font-bold text-white"
        style={{
          fontSize: label !== undefined ? size * 0.4 : size * 0.22,
          textShadow: "0 2px 4px rgba(0,0,0,0.8)"
        }}
      >
        {label !== undefined ? label : `${percent}%`}
      </div>
    </div>
  );
}