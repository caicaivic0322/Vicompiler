
declare global {
  interface Window {
    loadPyodide: any;
  }
}

let pyodide: any = null;

export const executePythonCode = async (code: string, stdin: string = ""): Promise<{ success: boolean; output: string }> => {
  try {
    // 1. Initialize Pyodide if not already loaded
    if (!pyodide) {
      if (!window.loadPyodide) {
         throw new Error("Pyodide script is still loading. Please try again in a moment.");
      }
      pyodide = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.0/full/"
      });
    }

    // 2. Prepare Python code wrapper to capture stdout/stderr and inject stdin
    const captureCode = `
import sys
import io
import traceback

# Setup stdin from JS provided string
sys.stdin = io.StringIO(input_stdin)

# Capture stdout and stderr
sys.stdout = io.StringIO()
sys.stderr = sys.stdout

# Define a function to run user code safely
def run_user_code(user_code):
    try:
        # Create a fresh global scope for this run
        user_globals = {}
        exec(user_code, user_globals)
    except Exception:
        # Print the traceback if an error occurs
        traceback.print_exc()

# Run the user code passed from JS
run_user_code(code_to_run)
`;

    // 3. Pass variables to Python scope
    pyodide.globals.set("code_to_run", code);
    pyodide.globals.set("input_stdin", stdin);
    
    // 4. Run the wrapper
    await pyodide.runPythonAsync(captureCode);
    
    // 5. Retrieve the output from the string buffer
    const output = pyodide.runPython("sys.stdout.getvalue()");
    
    return { success: true, output: output };

  } catch (err: any) {
    console.error("Pyodide Execution Error:", err);
    return { success: false, output: `System Error: ${err.message || String(err)}` };
  }
};
