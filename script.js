const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");

let expression = "";
let isError = false;
let inverseMode = false;

// Factorial helper
function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
}

// Update display
function updateDisplay(value) {
    display.textContent = value || "0";
}

// Map function buttons with normal and inverse labels & internal logic
const functionButtons = {
    sin: { normal: "sin(", inverse: "asin(", normalLabel: "sin", inverseLabel: "sin⁻¹" },
    cos: { normal: "cos(", inverse: "acos(", normalLabel: "cos", inverseLabel: "cos⁻¹" },
    tan: { normal: "tan(", inverse: "atan(", normalLabel: "tan", inverseLabel: "tan⁻¹" },
    log: { normal: "log(", inverse: "10(", normalLabel: "log", inverseLabel: "10^x" },
    ln:  { normal: "ln(", inverse: "e(", normalLabel: "ln", inverseLabel: "e^x" }
};

// Grab the actual button elements
const buttonElements = {};
Object.keys(functionButtons).forEach(id => {
    buttonElements[id] = document.getElementById(id);
});

// Evaluate expression safely
function evaluateExpression(exp) {
    try {
        exp = autoCloseParentheses(exp);
        // UI symbols → JS symbols
        exp = exp.replace(/x/g, "*");

        // Constants
        exp = exp.replace(/π/g, Math.PI).replace(/\be\b/g, Math.E);

        // Factorial
        exp = exp.replace(/(\d+)!/g, (_, n) => factorial(Number(n)));

        // Power
        exp = exp.replace(/\^/g, "**");

        // Square root
        exp = exp.replace(/√/g, "Math.sqrt");

        // Inverse trig
        exp = exp.replace(/asin/g, "Math.asin");
        exp = exp.replace(/acos/g, "Math.acos");
        exp = exp.replace(/atan/g, "Math.atan");

        // Normal trig
        exp = exp.replace(/sin/g, "Math.sin");
        exp = exp.replace(/cos/g, "Math.cos");
        exp = exp.replace(/tan/g, "Math.tan");

        // Inverse log / ln
        exp = exp.replace(/10\(/g, "Math.pow(10,");
        exp = exp.replace(/e\(/g, "Math.exp(");

        // Normal log / ln
        exp = exp.replace(/log\(/g, "Math.log10(");
        exp = exp.replace(/ln\(/g, "Math.log(");

        // Bitwise
        exp = exp.replace(/AND/g, "&");
        exp = exp.replace(/OR/g, "|");
        exp = exp.replace(/XOR/g, "^");

        const result = Function('"use strict"; return (' + exp + ')')();

        if (!isFinite(result)) throw "Math Error";
        return result;
    } catch {
        return "Error";
    }
}

// Toggle inverse mode and update button labels
function toggleInverse() {
    inverseMode = !inverseMode;
    Object.keys(functionButtons).forEach(id => {
        const btn = buttonElements[id];
        btn.textContent = inverseMode ? functionButtons[id].inverseLabel : functionButtons[id].normalLabel;
    });
}

// Button click handling
buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        if (isError) {
            expression = "";
            isError = false;
        }

        const id = btn.id;
        const value = btn.textContent;

        switch (id) {
            case "clear":
                expression = "";
                updateDisplay("0");
                break;

            case "backspace":
                expression = expression.slice(0, -1);
                updateDisplay(expression || "0");
                break;

            case "equals":
                const res = evaluateExpression(expression);
                updateDisplay(res);
                expression = res === "Error" ? "" : res.toString();
                if (res === "Error") isError = true;
                break;

            case "square-root":
                expression += "√(";
                updateDisplay(expression);
                break;

            case "percentage":
                expression += "/100";
                updateDisplay(expression);
                break;

            case "factorial":
                expression += "!";
                updateDisplay(expression);
                break;

            case "power":
                expression += "^";
                updateDisplay(expression);
                break;

            case "pi":
                expression += "π";
                updateDisplay(expression);
                break;

            case "e":
                expression += "e";
                updateDisplay(expression);
                break;

            case "inv":
                toggleInverse();
                break;

            default:
                if (functionButtons[id]) {
                    expression += inverseMode ? functionButtons[id].inverse : functionButtons[id].normal;
                    // inverseMode stays active until toggled off (like a real calculator)
                    updateDisplay(expression);
                } else {
                    // numbers, operators, parentheses, AND/OR/XOR
                    expression += value;
                    updateDisplay(expression);
                }
                break;
        }
    });
});

function autoCloseParentheses(exp) {
    let open = 0;
    for (let ch of exp) {
        if (ch === "(") open++;
        if (ch === ")") open--;
    }
    return exp + ")".repeat(open);
}
