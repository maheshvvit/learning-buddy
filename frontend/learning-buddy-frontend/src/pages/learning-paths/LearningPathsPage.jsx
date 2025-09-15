import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLearningPaths } from '../../services/learningPathService';
import { Button } from '../../components/ui/button';

const LearningPathsPage = () => {
  const [learningPaths, setLearningPaths] = useState([]);
  const [filteredPaths, setFilteredPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadLearningPaths = async () => {
      try {
        const data = await fetchLearningPaths();
        if (Array.isArray(data)) {
          setLearningPaths(data);
          setFilteredPaths(data);
        } else {
          setError('Invalid data format received for learning paths.');
          setLearningPaths([]);
          setFilteredPaths([]);
        }
      } catch (_) {
        setError('Failed to load learning paths.');
      } finally {
        setLoading(false);
      }
    };
    loadLearningPaths();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPaths(learningPaths);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      const filtered = learningPaths.filter(
        (path) =>
          path.title.toLowerCase().includes(lowerSearch) ||
          path.description.toLowerCase().includes(lowerSearch)
      );
      setFilteredPaths(filtered);
    }
  }, [searchTerm, learningPaths]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (filteredPaths.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Learning Paths</h1>
        <p className="text-muted-foreground">Structured learning journeys to master new skills.</p>
        <div className="text-center py-12">
          <p className="text-muted-foreground">No learning paths found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Learning Paths</h1>
      <p className="text-muted-foreground">Structured learning journeys to master new skills.</p>
      <input
        type="text"
        placeholder="Search learning paths..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPaths.map((path) => (
          <div key={path._id} className="border rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">{path.title}</h2>
            <p className="text-muted-foreground mb-4">{path.description}</p>
            <p className="mb-2"><strong>Difficulty:</strong> {path.difficulty}</p>
            <p className="mb-4"><strong>Duration:</strong> {path.duration} hours</p>
            <Button onClick={() => navigate(`/app/learning-paths/${path._id}`)}>Start Learning</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningPathsPage;

