using Serilog;

using System.IO;

namespace Para.bot.Util
{
    public static class DirectorySetup
    {
        public readonly static string botBaseDirectory = Path.Combine("ParaBotFiles");

        public static void MakeSureAllDirectoriesExist()
        {
            Log.Information("Making sure all necessary directories exist");
            MakeSureBaseDirectoryExists();
            MakeSureSettingsDirectoryExists(Path.GetFullPath(AppSettings.settingsFileDirectory));
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

        internal static void MakeSureSettingsDirectoryExists(string settingsFileDirectory)
        {
            if (Directory.Exists(settingsFileDirectory))
            {
                Log.Information($"Para.bot settings file directory found at {settingsFileDirectory}");
            }
            else
            {
                Log.Error($"Para.bot settings file directory not found, creating directory at: {settingsFileDirectory}");
                Directory.CreateDirectory(settingsFileDirectory);
            }
        }
    }
}
