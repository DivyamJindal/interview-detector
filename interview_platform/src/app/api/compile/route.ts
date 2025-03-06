import { NextRequest, NextResponse } from 'next/server';

interface CompileRequest {
  code: string;
  language: string;
}

interface CompileResponse {
  success: boolean;
  output: string;
  error?: string;
}

// Mock compilation function - in a real app, this would connect to a secure backend service
const compileAndExecuteCode = async (code: string, language: string): Promise<CompileResponse> => {
  // In a production environment, this would be replaced with a secure sandbox execution
  // using containerization (Docker) or a specialized code execution service
  
  try {
    // Simulate compilation delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Language-specific mock responses
    switch (language) {
      case 'javascript':
      case 'typescript':
        return {
          success: true,
          output: `Output\n${mockJsExecution(code)}`
        };
      case 'python':
        return {
          success: true,
          output: `Output\n${mockPythonExecution(code)}`
        };
      case 'java':
        return {
          success: true,
          output: `Output\n${mockJavaExecution(code)}`
        };
      case 'cpp':
        return {
          success: true,
          output: `Output\n${mockCppExecution(code)}`
        };
      default:
        return {
          success: false,
          output: '',
          error: `Unsupported language: ${language}`
        };
    }
  } catch (error) {
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Mock execution functions for different languages
function mockJsExecution(code: string): string {
  // Simple detection of console.log statements
  const logMatches = code.match(/console\.log\(([^)]+)\)/g);
  
  if (logMatches && logMatches.length > 0) {
    return logMatches
      .map(match => {
        const content = match.substring(12, match.length - 1);
        return `> ${content}`;
      })
      .join('\n');
  }
  
  return 'Code executed successfully. No output detected.';
}

function mockPythonExecution(code: string): string {
  // Simple detection of print statements
  const printMatches = code.match(/print\(([^)]+)\)/g);
  
  if (printMatches && printMatches.length > 0) {
    return printMatches
      .map(match => {
        const content = match.substring(6, match.length - 1);
        return `> ${content}`;
      })
      .join('\n');
  }
  
  return 'Code executed successfully. No output detected.';
}

function mockJavaExecution(code: string): string {
  // Simple detection of System.out.println statements
  const printMatches = code.match(/System\.out\.println\(([^)]+)\)/g);
  
  if (printMatches && printMatches.length > 0) {
    return printMatches
      .map(match => {
        const content = match.substring(19, match.length - 1);
        return `> ${content}`;
      })
      .join('\n');
  }
  
  return 'Code compiled and executed successfully. No output detected.';
}

function mockCppExecution(code: string): string {
  // Simple detection of cout statements
  const coutMatches = code.match(/cout\s*<<\s*([^;]+);/g);
  
  if (coutMatches && coutMatches.length > 0) {
    return coutMatches
      .map(match => {
        const content = match.substring(match.indexOf('<<') + 2, match.length - 1).trim();
        return `> ${content}`;
      })
      .join('\n');
  }
  
  return 'Code compiled and executed successfully. No output detected.';
}

export async function POST(request: NextRequest) {
  try {
    const body: CompileRequest = await request.json();
    
    if (!body.code || !body.language) {
      return NextResponse.json(
        { success: false, error: 'Code and language are required' },
        { status: 400 }
      );
    }
    
    const result = await compileAndExecuteCode(body.code, body.language);
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        output: '', 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}