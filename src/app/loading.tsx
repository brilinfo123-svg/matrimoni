import { FiHeart } from "react-icons/fi";

import styles from "./loading.module.scss";

const Loading = () => {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner}>
        <FiHeart aria-hidden="true" />
      </div>
    </div>
  );
};

export default Loading;