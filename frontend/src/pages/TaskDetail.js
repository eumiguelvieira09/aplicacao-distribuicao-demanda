import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const TaskDetail = () => {
    const { id } = useParams();
    const [task, setTask] = useState(null);

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5000/api/tasks/${id}`, {
                    headers: { Authorization: token }
                });
                setTask(response.data);
            } catch (error) {
                console.error('Failed to fetch task:', error);
            }
        };
        fetchTask();
    }, [id]);

    if (!task) return <div>Loading...</div>;

    return (
        <div>
            <h1>{task.title}</h1>
            <p>{task.description}</p>
            <p>Deadline: {task.deadline}</p>
            <p>Time Spent: {task.time_spent} hours</p>
        </div>
    );
};

export default TaskDetail;