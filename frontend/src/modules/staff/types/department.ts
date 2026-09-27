export interface DepartmentItem {
  id: string;
  code: string;
  name: string;
  description: string;
  headId?: string;
  headName?: string;
  headPhone?: string;
  headEmail?: string;
  location?: string;
  memberCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentFilterParams {
  search?: string;
  status?: string;
}

export interface CreateDepartmentInput {
  code: string;
  name: string;
  description?: string;
  headId?: string;
  headName?: string;
  headPhone?: string;
  headEmail?: string;
  location?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateDepartmentInput {
  code?: string;
  name?: string;
  description?: string;
  headId?: string;
  headName?: string;
  headPhone?: string;
  headEmail?: string;
  location?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
