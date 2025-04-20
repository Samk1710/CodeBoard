'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CodeBracketIcon, DocumentCheckIcon, ChartBarIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-800 rounded-lg animate-pulse" />
});

const developerTypes = [
  { value: 'frontend', label: 'Frontend Developer' },
  { value: 'backend', label: 'Backend Developer' },
  { value: 'fullstack', label: 'Full Stack Developer' },
  { value: 'devops', label: 'DevOps Engineer' },
  { value: 'mobile', label: 'Mobile Developer' },
];

interface Assessment {
  task: {
    title: string;
    description: string;
    targetFiles: {
      path: string;
      currentContent: string;
      expectedChanges: string;
    }[];
    requirements: string[];
    hints: string[];
  };
  score?: number;
  feedback?: string;
  roadmap?: string[];
}

export default function PlaybookPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>('');
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [fileContents, setFileContents] = useState<{ [key: string]: string }>({});

  const startAssessment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/assessment/start?repo=${encodeURIComponent(params.repo as string)}&type=${selectedType}`);
      if (!response.ok) throw new Error('Failed to start assessment');
      const data = await response.json();
      setAssessment(data);
      // Initialize file contents with current content
      const initialContents: { [key: string]: string } = {};
      data.task.targetFiles.forEach((file: any) => {
        initialContents[file.path] = file.currentContent;
      });
      setFileContents(initialContents);
    } catch (error) {
      console.error('Error starting assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitSolution = async () => {
    try {
      console.log(fileContents);
      console.log(assessment?.task);
      console.log(params.repo);
      setSubmitting(true);
      const response = await fetch(`/api/assessment/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repo: params.repo,
          task: assessment?.task,
          solution: fileContents,
        }),
      });
      if (!response.ok) throw new Error('Failed to evaluate solution');
      const data = await response.json();
      console.log(data);
      setAssessment(data);
    } catch (error) {
      console.error('Error submitting solution:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;
    const currentFile = assessment?.task.targetFiles[currentFileIndex];
    if (currentFile) {
      setFileContents(prev => ({
        ...prev,
        [currentFile.path]: value
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="backdrop-blur-lg bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/20">
            <CardHeader>
              <div className="flex items-center gap-4">
                <DocumentCheckIcon className="h-8 w-8 text-purple-400" />
                <div>
                  <CardTitle className="text-3xl font-bold text-white">Codebase Playbook</CardTitle>
                  <p className="text-gray-400">Take an assessment to evaluate your understanding of the codebase</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {!assessment ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="backdrop-blur-lg bg-white/5 border-purple-500/20">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-white text-lg">Select your developer type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select developer type" />
                    </SelectTrigger>
                    <SelectContent>
                      {developerTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={startAssessment}
                  disabled={!selectedType || loading}
                  className="w-full bg-purple-500 hover:bg-purple-600"
                >
                  {loading ? 'Starting Assessment...' : 'Start Assessment'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : assessment.score === undefined ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="backdrop-blur-lg bg-white/5 border-purple-500/20">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold text-white mb-2">{assessment.task.title}</h3>
                    <p className="text-gray-300 mb-4">{assessment.task.description}</p>
                    <div className="space-y-2">
                      <h4 className="text-lg font-medium text-white">Requirements:</h4>
                      <ul className="space-y-1">
                        {assessment.task.requirements.map((req, index) => (
                          <li key={index} className="text-gray-300">• {req}</li>
                        ))}
                      </ul>
                    </div>
                    {assessment.task.hints.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-lg font-medium text-white flex items-center gap-2">
                          <LightBulbIcon className="h-5 w-5 text-yellow-400" />
                          Hints
                        </h4>
                        <ul className="space-y-1">
                          {assessment.task.hints.map((hint, index) => (
                            <li key={index} className="text-gray-300">• {hint}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <h4 className="text-lg font-medium text-white">Files to Modify:</h4>
                      <Select
                        value={currentFileIndex.toString()}
                        onValueChange={(value) => setCurrentFileIndex(parseInt(value))}
                      >
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="Select file" />
                        </SelectTrigger>
                        <SelectContent>
                          {assessment.task.targetFiles.map((file, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {file.path}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="h-[500px] border border-purple-500/20 rounded-lg overflow-hidden">
                      <MonacoEditor
                        height="100%"
                        language="typescript"
                        theme="vs-dark"
                        value={fileContents[assessment.task.targetFiles[currentFileIndex].path]}
                        onChange={handleEditorChange}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: 'on',
                          roundedSelection: false,
                          scrollBeyondLastLine: false,
                          readOnly: false,
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={submitSolution}
                    disabled={submitting}
                    className="w-full bg-purple-500 hover:bg-purple-600"
                  >
                    {submitting ? 'Submitting...' : 'Submit Solution'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="backdrop-blur-lg bg-white/5 border-purple-500/20">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <ChartBarIcon className="h-6 w-6 text-purple-400" />
                  <h3 className="text-xl font-semibold text-white">Assessment Results</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-white mb-2">Score</h4>
                    <p className="text-3xl font-bold text-purple-400">{assessment.score}%</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-white mb-2">Feedback</h4>
                    <p className="text-gray-300">{assessment.feedback}</p>
                  </div>
                  {assessment.roadmap && (
                    <div className="bg-white/5 p-4 rounded-lg">
                      <h4 className="text-lg font-medium text-white mb-2">Improvement Roadmap</h4>
                      <ul className="space-y-2">
                        {assessment.roadmap.map((item: string, index: number) => (
                          <li key={index} className="text-gray-300">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => setAssessment(null)}
                  className="w-full bg-purple-500 hover:bg-purple-600"
                >
                  Take Another Assessment
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
} 