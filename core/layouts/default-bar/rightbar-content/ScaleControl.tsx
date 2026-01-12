import Slider from './Slider';
import { classMixin } from '../../../utils/class-mixin';
import { LayoutConfig, ScaleControlProps } from '@/core/types/admin-layout';

const ScaleControl = ({ layoutConfig, setLayoutConfig, scales, t }: ScaleControlProps) => {
    return (
        <div className="scale-control">
            <div className="scale-header">
                <h5>{t('config.scale')}</h5>
                <span className="scale-value">{layoutConfig.scale}px</span>
            </div>
            <div className="slider-container">
                <Slider
                    value={layoutConfig.scale}
                    onChange={(e) => {
                        setLayoutConfig((prevState: LayoutConfig) => ({
                            ...prevState,
                            scale: e.value as number,
                        }));
                    }}
                    min={scales[0]}
                    max={scales[scales.length - 1]}
                    step={1}
                />
                <div className="scale-markers">
                    {scales.map((scale) => (
                        <div
                            key={scale}
                            className={classMixin('marker', {
                                active: scale === layoutConfig.scale,
                            })}
                            onClick={() => {
                                setLayoutConfig((prevState: LayoutConfig) => ({
                                    ...prevState,
                                    scale: scale,
                                }));
                            }}
                        >
                            <span className="dot"></span>
                            <span className="label">{scale}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ScaleControl;
