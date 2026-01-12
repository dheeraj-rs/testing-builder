import DragDropBuilder from './components/DragDropBuilder';

export default function DragDropBuilderPage() {
    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <DragDropBuilder standaloneServer={false} />
        </div>
    );
}
