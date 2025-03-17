import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

const KanbanColumn = ({ column, tasks, onTaskClick }) => {
    return (
        <Droppable droppableId={column.id}>
            {(provided) => (
                <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="column"
                >
                    <h2 className="column-title">{column.title}</h2>
                    <div className="task-list">
                        {tasks.map((task, index) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                index={index}
                                onClick={() => onTaskClick(task.id)}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                </div>
            )}
        </Droppable>
    );
};

export default KanbanColumn; 