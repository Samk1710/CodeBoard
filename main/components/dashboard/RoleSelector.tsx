'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

const roles = [
  { id: 'frontend', label: 'Frontend Developer' },
  { id: 'backend', label: 'Backend Developer' },
  { id: 'fullstack', label: 'Full Stack Developer' },
  { id: 'devops', label: 'DevOps Engineer' },
];

interface RoleSelectorProps {
  onRoleSelect: (role: string) => void;
}

export function RoleSelector({ onRoleSelect }: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<string>('');

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    onRoleSelect(role);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select Your Role</h2>
      <div className="flex flex-wrap gap-4">
        {roles.map((role) => (
          <Button
            key={role.id}
            variant={selectedRole === role.id ? 'default' : 'outline'}
            onClick={() => handleRoleSelect(role.id)}
          >
            {role.label}
          </Button>
        ))}
      </div>
    </div>
  );
} 