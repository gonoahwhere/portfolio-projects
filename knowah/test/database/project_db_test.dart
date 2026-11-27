// drift/native.dart lets us make a database that lives only in memory
import 'package:drift/native.dart';

// flutter_test gives us test(), expect() and the checks used below
import 'package:flutter_test/flutter_test.dart';

// The database that is about to be built doesn't exist yet, so the tests fail
import 'package:knowah/database/app_db.dart';
import 'package:knowah/models/project.dart';

void main() {
    // 'late' means this gets its value later, in setUp
    late AppDB database;

    // setUp runs before every test, so each test starts wtih a fresh empty database
    setUp(() {
        database = AppDB(NativeDatabase.memory());
    });

    // tearDown runs after every test and closes the database
    tearDown(() async {
        await database.close();
    });

    // TC23: a saved project can be found again
    test('TC23: A saved project can be found again', () async {
        final project = Project(name: 'Side-Scroller');

        await database.saveProject(project);

        // The list of all projects should contain a project with the ID
        // The IDs are compared as the database gives back a new Project object
        final all = await database.getAllProjects();
        expect(all.map((p) => p.id), contains(project.id));

        // Finding it by ID should give back the same name
        final found = await database.getProjectById(project.id);
        expect(found?.name, 'Side-Scroller');
    });

    // TC24: saving with an ID that is already there replaces the old project
    test('TC24: Saving a project with an existing ID replaces it', () async {
        await database.saveProject(Project(name: 'Side-Scroller', id: 'abc'));
        await database.saveProject(Project(name: 'Card Battler', id: 'abc'));

        // Only one project should exist, and it should be the newer one
        final all = await database.getAllProjects();
        expect(all.length, 1);
        expect(all.first.name, 'Card Battler');
    });

    // TC25: a deleted project is gone
    test('TC25: A deleted project is gone', () async {
        final project = Project(name: 'Side-Scroller');
        await database.saveProject(project);

        await database.deleteProject(project.id);

        // The list is empty, and looking it by ID finds nothing
        expect(await database.getAllProjects(), isEmpty);
        expect(await database.getProjectById(project.id), isNull);
    });
}