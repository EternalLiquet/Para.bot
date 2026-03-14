using Serilog;

namespace Para.bot.Util
{
    public static class Support
    {
        public static void StartupOperations()
        {
            LogHandler.CreateLoggerConfiguration();
            DirectorySetup.MakeSureAllDirectoriesExist();
            AppSettings.LoadSettings();
            MongoDbClient.InstantiateMongoDriver();
            Log.Information("Startup Operations complete");
        }
    }
}
