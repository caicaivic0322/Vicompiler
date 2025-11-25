
interface PistonResponse {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
}

export const executeCppCode = async (code: string, stdin: string = ""): Promise<{ success: boolean; output: string }> => {
  try {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: 'cpp',
        version: '10.2.0', // GCC 10.x
        files: [
          {
            content: code,
          },
        ],
        stdin: stdin, // Pass standard input
      }),
    });

    if (!response.ok) {
      throw new Error(`Piston API Error: ${response.statusText}`);
    }

    const data = (await response.json()) as PistonResponse;

    // Check exit code. 0 usually means success.
    if (data.run.code === 0) {
      return { success: true, output: data.run.stdout };
    } else {
      // Return stderr if compilation or runtime failed
      return { success: false, output: data.run.stderr || data.run.stdout };
    }
  } catch (error) {
    console.error("Piston Execution Failed:", error);
    return { success: false, output: "Failed to connect to the compilation server." };
  }
};
