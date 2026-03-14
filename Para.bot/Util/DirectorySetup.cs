using Serilog;

using System.IO;

namespace Para.bot.Util
{
    public static class DirectorySetup
    {
        public readonly static string botBaseDirectory = Path.Combine("ParaBotFiles");
        public readonly static string logDirectory = Path.Combine(botBaseDirectory, "Logs");

        public static void MakeSureAllDirectoriesExist()
        {
            Log.Information("Making sure all necessary directories exist");
            MakeSureBaseDirectoryExists();
            MakeSureDirectoryExists(logDirectory, "log");
        }

        internal static void MakeSureBaseDirectoryExists()
        {
            if (Directory.Exists(botBaseDirectory))
            {
                Log.Information($"Para.bot base file directory found at {Path.GetFullPath(botBaseDirectory)}");
            }
            else
            {
                Log.Error($"Para.bot base file directory not found, creating directory at: {Path.GetFullPath(botBaseDirectory)}");
                Directory.CreateDirectory(Path.GetFullPath(botBaseDirectory));
            }
        }

        internal static void MakeSureDirectoryExists(string directoryPath, string directoryDescription)
        {
            string fullPath = Path.GetFullPath(directoryPath);
            if (Directory.Exists(fullPath))
            {
                Log.Information($"Para.bot {directoryDescription} directory found at {fullPath}");
            }
            else
            {
                Log.Error($"Para.bot {directoryDescription} directory not found, creating directory at: {fullPath}");
                Directory.CreateDirectory(fullPath);
            }
        }
    }
}
