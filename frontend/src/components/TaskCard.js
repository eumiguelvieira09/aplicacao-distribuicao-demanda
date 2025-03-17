import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

const TaskCard = ({ task, index, onClick }) => {
    return (
        <Draggable draggableId={task.id.toString()} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`task ${task.status}`}
                    style={provided.draggableProps.style}
                    onClick={onClick}
                >
                    {task.labels && task.labels.length > 0 && (
                        <div className="labels-list">
                            {task.labels.map(labelId => (
                                <span 
                                    key={labelId} 
                                    className={`label-tag label-${labelId}`}
                                >
                                    {labelId}
                                </span>
                            ))}
                        </div>
                    )}
                    <h3>{task.title || 'Tarefa sem título'}</h3>
                    <p>{task.description}</p>
                    <p>Prazo: {task.deadline}</p>
                    <p>Responsáveis: {
                        Array.isArray(task.assignees) && task.assignees.length > 0
                            ? task.assignees.join(', ')
                            : 'Nenhum responsável'
                    }</p>
                </div>
            )}
        </Draggable>
    );
};

export default TaskCard; 