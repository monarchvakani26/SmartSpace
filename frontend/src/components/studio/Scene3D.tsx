import { Canvas, ThreeEvent } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';
import { LayoutItem } from '../../types';

interface Scene3DProps {
  lengthFt: number;
  widthFt: number;
  heightFt: number;
  items: LayoutItem[];
  selectedItemId: string | null;
  onSelect: (id: string) => void;
}

const materialColor = (item: LayoutItem) => item.customizations?.colorHex
  || (item.category?.toLowerCase().includes('bed') ? '#9f7154' : '#78655a');

function Furniture({ item, selected, onSelect }: { item: LayoutItem; selected: boolean; onSelect: (id: string) => void }) {
  const stopAndSelect = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(item.id);
  };
  const height = item.verticalHeightFt || 2.5;
  // Layout coordinates represent a top-down plan; convert that shared model to X/Z.
  return (
    <group position={[item.x + item.widthFt / 2, height / 2, item.y + item.heightFt / 2]} rotation={[0, -item.rotation * Math.PI / 180, 0]}>
      <mesh castShadow receiveShadow onClick={stopAndSelect}>
        <boxGeometry args={[item.widthFt, height, item.heightFt]} />
        <meshStandardMaterial color={materialColor(item)} emissive={selected ? '#3826a8' : '#000000'} emissiveIntensity={selected ? 0.24 : 0} />
      </mesh>
      {selected && <mesh position={[0, height / 2 + 0.03, 0]}><boxGeometry args={[item.widthFt + .12, .06, item.heightFt + .12]} /><meshBasicMaterial color="#6d5dfc" /></mesh>}
    </group>
  );
}

function RoomShell({ lengthFt, widthFt, heightFt }: Pick<Scene3DProps, 'lengthFt' | 'widthFt' | 'heightFt'>) {
  const wallMaterial = <meshStandardMaterial color="#e9e2d8" roughness={.9} />;
  return <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[lengthFt / 2, 0, widthFt / 2]} receiveShadow>
      <planeGeometry args={[lengthFt, widthFt]} /><meshStandardMaterial color="#b8946c" roughness={.75} />
    </mesh>
    <mesh position={[lengthFt / 2, heightFt / 2, 0]} receiveShadow><boxGeometry args={[lengthFt, heightFt, .15]} />{wallMaterial}</mesh>
    <mesh position={[0, heightFt / 2, widthFt / 2]} receiveShadow><boxGeometry args={[.15, heightFt, widthFt]} />{wallMaterial}</mesh>
  </>;
}

export function Scene3D(props: Scene3DProps) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-slate-950">
      <Canvas shadows camera={{ position: [props.lengthFt * 1.05, props.heightFt * 1.1, props.widthFt * 1.3], fov: 46 }} onPointerMissed={() => props.onSelect('')}>
        <color attach="background" args={['#101827']} />
        <ambientLight intensity={.7} />
        <directionalLight position={[props.lengthFt / 2, props.heightFt, props.widthFt / 3]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} />
        <RoomShell {...props} />
        {props.items.map(item => <Furniture key={item.id} item={item} selected={item.id === props.selectedItemId} onSelect={props.onSelect} />)}
        <Grid args={[props.lengthFt * 2, props.widthFt * 2]} position={[props.lengthFt / 2, .01, props.widthFt / 2]} cellSize={1} cellColor="#5d6877" sectionSize={5} sectionColor="#8994a5" fadeDistance={32} />
        <OrbitControls makeDefault target={[props.lengthFt / 2, 2, props.widthFt / 2]} maxPolarAngle={Math.PI / 2.05} />
      </Canvas>
      <div className="absolute left-3 top-3 rounded-lg border border-white/15 bg-slate-950/75 px-2.5 py-1.5 text-[10px] font-medium text-slate-200">Drag to orbit · scroll to zoom · click furniture to edit</div>
    </div>
  );
}
