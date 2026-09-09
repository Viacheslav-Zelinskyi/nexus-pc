import { type FC, type CSSProperties } from "react";
import Image, { type ImageProps } from "next/image";
import clsx from "clsx";
import styles from "./glitch_image.module.scss";

interface GlitchImageProps extends ImageProps {
  speed?: number;
  enableGlitch?: boolean;
  enableShadows?: boolean;
  className?: string;
}

interface CustomCSSProperties extends CSSProperties {
  "--after-duration": string;
  "--before-duration": string;
}

const GlitchImage: FC<GlitchImageProps> = ({
  src,
  alt,
  width,
  height,
  speed = 1,
  enableGlitch = true,
  enableShadows = true,
  className = "",
  ...props
}) => {
  const inlineStyles: CustomCSSProperties = {
    "--after-duration": `${speed * 3}s`,
    "--before-duration": `${speed * 2}s`,
  };

  return (
    <div
      className={clsx(
        styles.glitchWrapper,
        enableShadows && styles.enableShadows,
        className,
      )}
      style={inlineStyles}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={styles.mainImage}
        {...props}
      />

      {enableGlitch && (
        <>
          <div className={clsx(styles.glitchLayer, styles.layer1)}>
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              {...props}
            />
          </div>
          <div className={clsx(styles.glitchLayer, styles.layer2)}>
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              {...props}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default GlitchImage;
