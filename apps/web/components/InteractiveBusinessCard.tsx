"use client";

import { useRef, useState } from "react";
import { PublicBusinessCard } from "@/lib/cardEncoding";
import { CardBackground } from "@/lib/cardBackgrounds";
import styles from "./InteractiveBusinessCard.module.css";

interface Props {
  card: PublicBusinessCard;
  background: CardBackground;
}

const MAX_TILT = 14;

export function InteractiveBusinessCard({ card, background }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height; // 0..1
    const rotateY = (px - 0.5) * MAX_TILT * 2;
    const rotateX = (0.5 - py) * MAX_TILT * 2;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className={styles.stage}>
      <div
        ref={cardRef}
        className={styles.perspective}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={handleMouseLeave}
        onClick={() => setFlipped((f) => !f)}
        role="button"
        tabIndex={0}
        aria-label="Odwróć wizytówkę"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setFlipped((f) => !f);
        }}
      >
        <div
          className={styles.flipLayer}
          style={{ transform: `rotateY(${flipped ? 180 : 0}deg)` }}
        >
          <div
            className={styles.tiltLayer}
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: isHovering ? "transform 80ms linear" : "transform 500ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {/* PRZÓD */}
            <div
              className={styles.face}
              style={{
                background: `linear-gradient(135deg, ${background.colorStart}, ${background.colorEnd})`,
                color: background.textColor,
              }}
            >
              <div className={styles.sheen} />
              <div>
                <div className={styles.name}>
                  {card.firstName} {card.lastName}
                </div>
                <div className={styles.job}>{card.jobTitle}</div>
              </div>
              {card.company && <div className={styles.company}>{card.company}</div>}
            </div>

            {/* TYŁ */}
            <div className={`${styles.face} ${styles.back}`}>
              <div className={styles.backMark}>C</div>
              <div className={styles.backWordmark}>Cardly</div>
              <div className={styles.backTag}>Cyfrowa wizytówka</div>
            </div>
          </div>
        </div>
      </div>
      <p className={styles.hint}>Przesuń kursor, żeby przechylić — kliknij, żeby odwrócić</p>
    </div>
  );
}
