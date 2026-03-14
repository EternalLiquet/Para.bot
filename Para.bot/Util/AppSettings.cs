using Serilog;

using System;
using System.Collections.Generic;
using System.IO;

namespace Para.bot.Util
{
    public static class AppSettings
    {
        private const string BotTokenEnvironmentVariable = "BOT_TOKEN";
        private const string MongoConnectionStringEnvironmentVariable = "MONGO_CONNECTION_STRING";
        private const string DotEnvFileName = ".env";

        public static Dictionary<string, string> Settings { get; private set; }

        public static void LoadSettings()
        {
            LoadDotEnvFileIfPresent();

            Settings = new Dictionary<string, string>
            {
                ["botToken"] = GetRequiredEnvironmentVariable(BotTokenEnvironmentVariable),
                ["mongoConnectionString"] = GetRequiredEnvironmentVariable(MongoConnectionStringEnvironmentVariable)
            };

            Log.Information("Application settings loaded from environment variables");
        }

        private static string GetRequiredEnvironmentVariable(string variableName)
        {
            string variableValue = Environment.GetEnvironmentVariable(variableName);
            if (!string.IsNullOrWhiteSpace(variableValue))
            {
                return variableValue;
            }

            throw new InvalidOperationException($"Required environment variable '{variableName}' is missing. Add it to your environment or {DotEnvFileName} file.");
        }

        private static void LoadDotEnvFileIfPresent()
        {
            string dotEnvPath = FindDotEnvFile();
            if (string.IsNullOrWhiteSpace(dotEnvPath))
            {
                Log.Information($"No {DotEnvFileName} file found. Falling back to process environment variables.");
                return;
            }

            foreach (string line in File.ReadAllLines(dotEnvPath))
            {
                string trimmedLine = line.Trim();
                if (string.IsNullOrWhiteSpace(trimmedLine) || trimmedLine.StartsWith("#"))
                {
                    continue;
                }

                int separatorIndex = trimmedLine.IndexOf('=');
                if (separatorIndex <= 0)
                {
                    continue;
                }

                string key = trimmedLine.Substring(0, separatorIndex).Trim();
                string value = trimmedLine.Substring(separatorIndex + 1).Trim();
                if (string.IsNullOrWhiteSpace(key) || !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable(key)))
                {
                    continue;
                }

                Environment.SetEnvironmentVariable(key, TrimWrappingQuotes(value));
            }

            Log.Information($"Loaded environment variables from {dotEnvPath}");
        }

        private static string FindDotEnvFile()
        {
            DirectoryInfo currentDirectory = new DirectoryInfo(Directory.GetCurrentDirectory());
            while (currentDirectory != null)
            {
                string dotEnvPath = Path.Combine(currentDirectory.FullName, DotEnvFileName);
                if (File.Exists(dotEnvPath))
                {
                    return dotEnvPath;
                }

                currentDirectory = currentDirectory.Parent;
            }

            return null;
        }

        private static string TrimWrappingQuotes(string value)
        {
            if (value.Length >= 2)
            {
                bool wrappedInDoubleQuotes = value.StartsWith("\"") && value.EndsWith("\"");
                bool wrappedInSingleQuotes = value.StartsWith("'") && value.EndsWith("'");
                if (wrappedInDoubleQuotes || wrappedInSingleQuotes)
                {
                    return value.Substring(1, value.Length - 2);
                }
            }

            return value;
        }
    }
}
