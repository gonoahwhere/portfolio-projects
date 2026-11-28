// Drift's building blocks, and the helper that picks where the database file lives
import 'package:drift/drift.dart';
import 'package:drift_flutter/drift_flutter.dart';

// The Project made in another file, containing the rules
import 'package:knowah/models/project.dart';

// The Item that is saved to and loaded from the database
import 'package:knowah/models/item.dart';

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

// The ITEMS table, one row for every item, in every project
// Called 'ItemRows' for the same reason as 'ProjectRows', Drift makes a class
// from the table name, and it shouldn't clash with the Item class
class ItemRows extends Table {
    // The item's own Id, and the ID of the project it belongs to
    TextColumn get id => text()();
    TextColumn get projectId => text()();

    // The item's title
    TextColumn get title => text()();

    // The status stored as text, like 'draft' or 'active
    TextColumn get status => text()();

    // The Id is the primary key, as no two rows can share an ID
    @override
    Set<Column> get primaryKey => {id};
}

// The DATABASE tells Drift which tables it contians
@DriftDatabase(tables: [ProjectRows, ItemRows])
class AppDB extends _$AppDB {
    // Tests pass in an in memory database file instead of a real file
    AppDB([QueryExecutor? executor]) : super(executor ?? driftDatabase(name: 'knowah'));

    // Bump this number everytime the tables change
    @override
    int get schemaVersion => 2;

    // What to do when an older database file is opened
    // 'from' is the version the file was made with
    @override
    MigrationStrategy get migration => MigrationStrategy(
        onUpgrade: (migrator, from, to) async {
            // Files made before version 2 have no items table, so add it
            if (from < 2) {
                await migrator.createTable(itemRows);
            }
        }
    );

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

    // SAVE ITEM: insert the item, or update it if the ID already exists
    // 'async' matters here, it turns a thrown error into a failed Future,
    // which is what the test checks for
    Future<void> saveItem(Item item) async {
        // An item with no project has nowhere to live, so refuse it
        if (item.projectId == null) {
            throw ArgumentError('An item must belong to a project');
        }

        await into(itemRows).insertOnConflictUpdate(
            ItemRowsCompanion.insert(
                id: item.id,
                // The ! says 'I know this isn't empty' as it was checked above
                projectId: item.projectId!,
                title: item.title,
                // .name turns ItemStatus.active into the text 'active
                status: item.status.name,
            ),
        );
    }

    // GET ITEMS: find th row whose projectId matches, and turn each into an Item
    Future<List<Item>> getItemsForProject(String projectId) async {
        final rows = await (select(itemRows)..where((t) => t.projectId.equals(projectId))).get();

        return rows.map((row) => Item(
            id: row.id,
            title: row.title,
            // byName turns the text 'active' back into ItemStatus.active
            status: ItemStatus.values.byName(row.status),
            projectId: row.projectId,
        )).toList();
    }
}