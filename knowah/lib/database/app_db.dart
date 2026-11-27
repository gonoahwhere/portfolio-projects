// Drift's building blocks, and the helper that picks where the database file lives
import 'package:drift/drift.dart';
import 'package:drift_flutter/drift_flutter.dart';

// The Project made in another file, containing the rules
import 'package:knowah/models/project.dart';

// This line points at a file that Drift will write
// Will be underlined in red until the file exists
part 'app_db.g.dart';

// A TABLE describes what one row of stored data looks like
// Called 'ProjectRows' instead of 'Projects' as Drift makes a class
// from the table name, and 'Projects' is taken already
class ProjectRows extends Table {
    // Two text coloumns, ID and name
    TextColumn get id => text()();
    TextColumn get name => text()();

    // The ID is the primary key, as no two rows can share an ID
    @override
    Set<Column> get primaryKey => {id};
}

// The DATABASE tells Drift which tables it contians
@DriftDatabase(tables: [ProjectRows])
class AppDB extends _$AppDB {
    // Tests pass in an in memory database file instead of a real file
    AppDB([QueryExecutor? executor]) : super(executor ?? driftDatabase(name: 'knowah'));

    // Bump this number everytime the tables change
    @override
    int get schemaVersion => 1;

    // SAVE: insert the project or update it if the ID already exists
    Future<void> saveProject(Project project) {
        return into(projectRows).insertOnConflictUpdate(
            ProjectRowsCompanion.insert(id: project.id, name: project.name),
        );
    }

    // GET ALL: read every row and turn each one into a Project
    Future<List<Project>> getAllProjects() async {
        final rows = await select(projectRows).get();
        return rows.map((row) => Project(id: row.id, name: row.name)).toList();
    }

    // GET ONE: find the row whos ID matches, or null if there isn't one
    Future<Project?> getProjectById(String id) async {
        final row = await (select(projectRows)..where((t) => t.id.equals(id))).getSingleOrNull();
        if (row == null) return null;
        return Project(id: row.id, name: row.name);
    }

    // DELETE: remove the row whos ID matches
    Future<void> deleteProject(String id) async {
        await (delete(projectRows)..where((t) => t.id.equals(id))).go();
    }
}