import { ReactNode } from "react";
import styles from "./PhoneFrame.module.css";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className={styles.frame}>
      <div className={styles.notch} />
      <div className={styles.screen}>{children}</div>
    </div>
  );
}
