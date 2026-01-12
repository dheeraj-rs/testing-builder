import { motion } from 'framer-motion';
import { memo } from 'react';
import { classNames } from '@/app/(builder)/website-builder/utils/classNames';
import { cubicEasingFn } from '@/app/(builder)/website-builder/utils/easings';
import { genericMemo } from '@/app/(builder)/website-builder/utils/react';

interface SliderOption<T> {
  value: T;
  text: string;
}

export interface SliderOptions<T> {
  left: SliderOption<T>;
  right: SliderOption<T>;
}

interface SliderProps<T> {
  selected: T;
  options: SliderOptions<T>;
  setSelected?: (selected: T) => void;
}

export const Slider = genericMemo(<T,>({ selected, options, setSelected }: SliderProps<T>) => {
  const isLeftSelected = selected === options.left.value;

  return (
    <div className="flex items-center flex-wrap shrink-0 gap-1 bg-surface-c overflow-hidden rounded-full p-1">
      <SliderButton selected={isLeftSelected} setSelected={() => setSelected?.(options.left.value)}>
        {options.left.text}
      </SliderButton>
      <SliderButton selected={!isLeftSelected} setSelected={() => setSelected?.(options.right.value)}>
        {options.right.text}
      </SliderButton>
    </div>
  );
});

interface SliderButtonProps {
  selected: boolean;
  children: React.ReactNode;
  setSelected: () => void;
}

const SliderButton = memo(({ selected, children, setSelected }: SliderButtonProps) => {
  return (
    <button
      onClick={setSelected}
      className={classNames(
        'bg-transparent text-sm px-2.5 py-0.5 rounded-full relative transition-colors',
        selected
          ? 'text-primary'
          : 'text-text-secondary hover:text-text',
      )}
    >
      <span className="relative z-10">{children}</span>
      {selected && (
        <motion.span
          layoutId="pill-tab"
          transition={{ duration: 0.2, ease: cubicEasingFn }}
          className="absolute inset-0 z-0 bg-primary/10 rounded-full"
        ></motion.span>
      )}
    </button>
  );
});
