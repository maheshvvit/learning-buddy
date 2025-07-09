import React, { useEffect, useState } from 'react';
import { fetchLearningPaths } from '../../services/learningPathService';
import { Button } from '../../components/ui/button';

const LearningPathsPage = () => {
  const [learningPaths, setLearningPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLearningPaths = async () => {
      try {
        const data = await fetchLearningPaths();
        setLearningPaths(data);
      } catch (_) {
        setError('Failed to load learning paths.');
      } finally {
        setLoading(false);
      }
    };
    loadLearningPaths();
  }, []);

  if (loading) {
    return <div>Loading learning paths...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (learningPaths.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Learning Paths</h1>
        <p className="text-muted-foreground">Structured learning journeys to master new skills.</p>
        <div className="text-center py-12">
          <p className="text-muted-foreground">No learning paths available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Learning Paths</h1>
      <p className="text-muted-foreground">Structured learning journeys to master new skills.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {learningPaths.map((path) => (
          <div key={path._id} className="border rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">{path.title}</h2>
            <p className="text-muted-foreground mb-4">{path.description}</p>
            <p className="mb-2"><strong>Difficulty:</strong> {path.difficulty}</p>
            <p className="mb-4"><strong>Duration:</strong> {path.duration} hours</p>
            <Button>Start Learning</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningPathsPage;

