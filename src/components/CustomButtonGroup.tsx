import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ButtonGroupProps } from "react-multi-carousel";

const ArrowButton = ({
  direction,
  onClick,
  className = "",
  isLeftDisabled,
  isRightDisabled,
}: {
  direction: "left" | "right";
  onClick: () => void;
  className: string;
  isLeftDisabled?: boolean;
  isRightDisabled?: boolean;
}) => {
  const Icon = direction === "left" ? ArrowLeft : ArrowRight;

  const baseStyles =
    "flex items-center justify-center px-4 py-2 rounded-lg font-semibold transition duration-300 ease-in-out text-white";
  const colorStyles =
    "bg-primary-100 hover:bg-primary-300 shadow-md hover:shadow-lg";

  const iconBaseStyles = "size-5 transition-transform duration-300";
  const iconHoverStyles =
    direction === "left"
      ? "group-hover:-translate-x-1"
      : "group-hover:translate-x-1";

  const isDisabled = direction === "left" ? isLeftDisabled : isRightDisabled;
  return (
    <Button
      onClick={onClick}
      size={"icon"}
      disabled={isDisabled}
      className={`${baseStyles} ${colorStyles} group ${className}`}
    >
      {direction === "left" && (
        <Icon className={`${iconBaseStyles} ${iconHoverStyles} `} />
      )}
      {direction === "right" && (
        <Icon className={`${iconBaseStyles} ${iconHoverStyles}`} />
      )}
    </Button>
  );
};

export const CarouselButtonGroup = ({
  next,
  previous,
  ...rest
}: ButtonGroupProps) => {
  if (!rest.carouselState) return null;

  const { currentSlide, totalItems, slidesToShow } = rest.carouselState;

  const isLeftDisabled = currentSlide === 0;
  const isRightDisabled = currentSlide >= totalItems - slidesToShow;

  return (
    <div className="hidden absolute overflow-x-visible w-full right-0 top-1/2 md:flex gap-2 justify-between z-10">
      <ArrowButton
        direction="left"
        onClick={() => previous?.()}
        className={"-left-11 relative"}
        isLeftDisabled={isLeftDisabled}
      />

      <ArrowButton
        direction="right"
        onClick={() => next?.()}
        className={"-right-11 relative"}
        isRightDisabled={isRightDisabled}
      />
    </div>
  );
};

export default CarouselButtonGroup;
