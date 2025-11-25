
export const CPP_EXAMPLES: Record<string, string> = {
  "Hello World": `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,

  "Variables & Types": `#include <iostream>
using namespace std;

int main() {
    int integerVar = 42;
    double doubleVar = 3.14159;
    char charVar = 'A';
    bool boolVar = true;
    
    cout << "Int: " << integerVar << endl;
    cout << "Double: " << doubleVar << endl;
    return 0;
}`,

  "If / Else": `#include <iostream>
using namespace std;

int main() {
    int score = 85;
    
    if (score >= 90) {
        cout << "Grade: A" << endl;
    } else if (score >= 80) {
        cout << "Grade: B" << endl;
    } else {
        cout << "Grade: C" << endl;
    }
    return 0;
}`,

  "Switch Case": `#include <iostream>
using namespace std;

int main() {
    int day = 3;
    
    switch (day) {
        case 1:
            cout << "Monday" << endl;
            break;
        case 2:
            cout << "Tuesday" << endl;
            break;
        case 3:
            cout << "Wednesday" << endl;
            break;
        default:
            cout << "Other" << endl;
    }
    return 0;
}`,

  "Loops: For": `#include <iostream>
using namespace std;

int main() {
    int sum = 0;
    // Standard loop to calculate sum of 1 to 5
    for (int i = 1; i <= 5; i++) {
        sum += i;
        cout << "i: " << i << ", sum: " << sum << endl;
    }
    return 0;
}`,

  "Loops: While": `#include <iostream>
using namespace std;

int main() {
    int count = 5;
    while (count > 0) {
        cout << count << "..." << endl;
        count--;
    }
    cout << "Liftoff!" << endl;
    return 0;
}`,

  "Loops: Do-While": `#include <iostream>
using namespace std;

int main() {
    int num = 0;
    do {
        cout << "Inside loop, num is " << num << endl;
        num++;
    } while (num < 3);
    return 0;
}`,

  "Functions": `#include <iostream>
using namespace std;

int multiply(int a, int b) {
    return a * b;
}

int main() {
    int x = 5;
    int y = 10;
    int result = multiply(x, y);
    cout << "Result: " << result << endl;
    return 0;
}`,

  "Pointers & References": `#include <iostream>
using namespace std;

// Pass by Pointer
void updateByPtr(int* p) {
    if (p != nullptr) {
        *p = 50;
    }
}

// Pass by Reference
void updateByRef(int& r) {
    r = 100;
}

int main() {
    int val = 10;
    int* ptr = &val; // Pointer holds address of val
    
    cout << "Original: " << val << endl;
    
    updateByPtr(&val);
    cout << "After Ptr: " << val << endl;
    
    updateByRef(val);
    cout << "After Ref: " << val << endl;
    
    return 0;
}`,

  "Arrays (Stack)": `#include <iostream>
using namespace std;

int main() {
    // Array allocated on stack
    int numbers[5] = {10, 20, 30, 40, 50};
    
    // Modify an element
    numbers[2] = 99;
    
    for(int i = 0; i < 5; i++) {
        cout << numbers[i] << " ";
    }
    cout << endl;
    return 0;
}`,

  "Strings": `#include <iostream>
#include <string>
using namespace std;

int main() {
    string greeting = "Hello";
    string target = "World";
    
    // Concatenation
    string message = greeting + ", " + target + "!";
    
    cout << message << endl;
    cout << "Length: " << message.length() << endl;
    return 0;
}`,

  "Heap Allocation (new/delete)": `#include <iostream>
using namespace std;

struct Point {
    int x, y;
};

int main() {
    // Dynamic integer
    int* pInt = new int(10);
    
    // Dynamic Object
    Point* pPoint = new Point();
    pPoint->x = 5;
    pPoint->y = 15;
    
    cout << *pInt << ", " << pPoint->x << endl;
    
    delete pInt;
    delete pPoint;
    return 0;
}`
};

export const PYTHON_EXAMPLES: Record<string, string> = {
  "Hello World": `print("Hello, World!")`,

  "Variables & Types": `def main():
    integer_var = 42
    float_var = 3.14
    string_var = "Python"
    bool_var = True
    
    print(f"Int: {integer_var}, Str: {string_var}")

main()`,

  "If / Else": `def main():
    score = 85
    
    if score >= 90:
        print("Grade: A")
    elif score >= 80:
        print("Grade: B")
    else:
        print("Grade: C")

main()`,

  "Loops: For": `def main():
    total = 0
    # Range 1 to 5
    for i in range(1, 6):
        total += i
        print(f"i: {i}, total: {total}")

main()`,

  "Loops: While": `def main():
    count = 5
    while count > 0:
        print(f"{count}...")
        count -= 1
    print("Liftoff!")

main()`,

  "Functions": `def add(a, b):
    return a + b

def main():
    x = 10
    y = 20
    result = add(x, y)
    print(f"Result: {result}")

main()`,

  "Lists (Array-like)": `def main():
    # Lists are dynamic arrays on the Heap
    numbers = [10, 20, 30]
    
    numbers.append(40)
    numbers[1] = 99
    
    for num in numbers:
        print(num)

main()`,

  "Strings": `def main():
    greeting = "Hello"
    target = "World"
    
    # String concatenation
    message = greeting + ", " + target + "!"
    
    print(message)
    print(f"Length: {len(message)}")

main()`,

  "Objects (Heap)": `class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

def main():
    # Objects live on the Heap
    p1 = Point(10, 20)
    
    # Reference copy (points to same object)
    p2 = p1
    p2.x = 999
    
    print(f"p1.x is also: {p1.x}")

main()`,

  "Recursion": `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

def main():
    print(factorial(4))

main()`
};

export const DEFAULT_CPP = CPP_EXAMPLES["Hello World"];
export const DEFAULT_PYTHON = PYTHON_EXAMPLES["Hello World"];
