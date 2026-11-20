export const LANGUAGE_ORDER = [
  'cpp',
  'python3',
  'c',
  'java',
  'pypy3',
  'csharp',
  'javascript',
  'go',
  'typescript',
  'php',
  'kotlin',
  'rust',
  'r',
  'sql',
  'oracledb',
] as const;

export type LanguageId = (typeof LANGUAGE_ORDER)[number];

export interface LanguageConfig {
  id: LanguageId;
  /** Label shown in the dropdown (matches the Figma "Python3" style). */
  label: string;
  /** Monaco language id used for highlighting / brackets / auto-indent. */
  monacoLanguage: string;
  /** File name shown on mobile + used for downloads. */
  fileName: string;
  /** Runtime name used in "Compiling & Executing in <runtime>..." */
  runtime: string;
  /** Editor status-bar label, e.g. "Python 3.10.x" */
  statusLabel: string;
  /** Used in the "Environment initialized" log line. */
  envVersion: string;
  /** Starter template. */
  template: string;
}

// NOTE: runtime/version strings other than Python 3.10 are PLACEHOLDER display
// labels. Phase 2 should fill them from the real execution backend.
function def(
  id: LanguageId,
  label: string,
  monacoLanguage: string,
  fileName: string,
  runtime: string,
  template: string,
  extra?: { status?: string; env?: string },
): LanguageConfig {
  return {
    id,
    label,
    monacoLanguage,
    fileName,
    runtime,
    statusLabel: extra?.status ?? runtime,
    envVersion: extra?.env ?? runtime,
    template,
  };
}

const list: LanguageConfig[] = [
  def(
    'cpp', 'C++', 'cpp', 'main.cpp', 'C++17',
    `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cout << "Hello, World!" << endl;
    return 0;
}
`,
  ),
  // Starter text is exactly what the Figma editor shows.
  def('python3', 'Python3', 'python', 'main.py', 'Python 3.10', `# code what's in your mind\n`, {
    status: 'Python 3.10.x',
    env: 'Python 3.10.12',
  }),
  def(
    'c', 'C', 'c', 'main.c', 'C11',
    `#include <stdio.h>

int main(void) {
    printf("Hello, World!\\n");
    return 0;
}
`,
  ),
  def(
    'java', 'Java', 'java', 'Main.java', 'Java 17',
    `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Hello, World!");
    }
}
`,
  ),
  def('pypy3', 'PyPy3', 'python', 'main.py', 'PyPy 3.9', `# code what's in your mind\n`),
  def(
    'csharp', 'C#', 'csharp', 'Program.cs', 'C# (.NET 8)',
    `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
    }
}
`,
  ),
  def('javascript', 'JavaScript', 'javascript', 'main.js', 'Node.js 20', `// code what's in your mind\nconsole.log("Hello, World!");\n`),
  def(
    'go', 'Go', 'go', 'main.go', 'Go 1.22',
    `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
`,
  ),
  def(
    'typescript', 'TypeScript', 'typescript', 'main.ts', 'TypeScript 5',
    `const greeting: string = "Hello, World!";
console.log(greeting);
`,
  ),
  def('php', 'PHP', 'php', 'main.php', 'PHP 8.3', `<?php\n\necho "Hello, World!\\n";\n`),
  def('kotlin', 'Kotlin', 'kotlin', 'Main.kt', 'Kotlin 1.9', `fun main() {\n    println("Hello, World!")\n}\n`),
  def('rust', 'Rust', 'rust', 'main.rs', 'Rust 1.77', `fn main() {\n    println!("Hello, World!");\n}\n`),
  def('r', 'R', 'r', 'main.R', 'R 4.3', `cat("Hello, World!\\n")\n`),
  def('sql', 'SQL', 'sql', 'query.sql', 'SQL', `-- write your query here\nSELECT 'Hello, World!' AS greeting;\n`),
  def('oracledb', 'OracleDB', 'sql', 'query.sql', 'Oracle SQL', `-- Oracle SQL\nSELECT 'Hello, World!' AS greeting FROM dual;\n`),
];

export const LANGUAGES = Object.fromEntries(list.map((l) => [l.id, l])) as Record<LanguageId, LanguageConfig>;

export const DEFAULT_LANGUAGE: LanguageId = 'python3';
