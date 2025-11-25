
// This script runs INSIDE Pyodide to trace execution
export const PYTHON_TRACE_SCRIPT = `
import sys
import json
import inspect

class Tracer:
    def __init__(self):
        self.steps = []
        self.heap_objects = {}
        self.step_counter = 0

    def serialize_val(self, val):
        t = type(val).__name__
        if val is None:
            return "None", "None"
        if isinstance(val, (int, float, bool, str)):
            return str(val), t
        
        # Handle Heap Objects (Lists, Dicts, Custom Objects)
        obj_id = hex(id(val))
        
        # If we haven't seen this object or it changed, record it
        val_str = str(val)
        if isinstance(val, list):
            val_str = str(val)
        elif hasattr(val, '__dict__'):
            val_str = str(val.__dict__)
            
        self.heap_objects[obj_id] = {
            "address": obj_id,
            "type": t,
            "value": val_str,
            "color": "#fcd34d" # Visual color hint
        }
        
        return val_str, t, obj_id

    def trace(self, frame, event, arg):
        if event != 'line':
            return self.trace

        code = frame.f_code
        filename = code.co_filename
        
        # Only trace the user's code (stdin or pseudo-file), not internal libs
        if filename != '<exec>' and 'pyodide' not in filename:
            return self.trace

        self.step_counter += 1
        line_no = frame.f_lineno
        func_name = code.co_name
        
        # Capture Stack
        stack_frames = []
        current = frame
        while current:
            if current.f_code.co_filename == '<exec>':
                variables = []
                for k, v in current.f_locals.items():
                    if k.startswith('__'): continue
                    
                    val_str, val_type, *rest = self.serialize_val(v)
                    address = rest[0] if rest else None
                    is_pointer = address is not None
                    
                    var_data = {
                        "name": k,
                        "type": val_type,
                        "value": val_str,
                        "isPointer": is_pointer
                    }
                    if is_pointer:
                        var_data["address"] = address
                        
                    variables.append(var_data)
                
                stack_frames.append({
                    "id": str(id(current)),
                    "functionName": current.f_code.co_name,
                    "variables": variables,
                    "line": current.f_lineno
                })
            current = current.f_back

        # Snapshot Heap
        heap_snapshot = list(self.heap_objects.values())

        step = {
            "stepId": self.step_counter,
            "line": line_no,
            "description": f"Line {line_no} in {func_name}",
            "stack": stack_frames,
            "heap": heap_snapshot,
            "consoleOutput": "" # Captured separately in JS
        }
        self.steps.append(step)
        return self.trace

t = Tracer()
sys.settrace(t.trace)

# --- USER CODE EXECUTION STARTS HERE ---
try:
    exec(user_code_to_trace, {})
except Exception:
    pass # Error handling is done in the outer runner
finally:
    sys.settrace(None)
    # Output the steps as the last line
    print("___TRACE_START___")
    print(json.dumps(t.steps))
    print("___TRACE_END___")
`;
