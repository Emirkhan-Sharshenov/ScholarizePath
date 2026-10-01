import {Composition} from 'remotion';
import {Constellation} from './Constellation';

const common = {component: Constellation, durationInFrames: 31 * 60, fps: 60, width: 1080, height: 1920} as const;
export const Root = () => (
	<>
		<Composition id="Constellation-ru" {...common} defaultProps={{lang: 'ru' as const}} />
		<Composition id="Constellation-en" {...common} defaultProps={{lang: 'en' as const}} />
	</>
);
