//Dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');
const pressAnyKey = require('press-any-key');
require('dotenv').config();

//Create Connection
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'employeeTracker_DB'
});
//User Prompt
const mainMenu = () => {
    inquirer
    .prompt({
        name: 'start',
        type: 'list',
        message: 'What would you like to do?',
        choices: ['Add Department', 'Add Role', 'Add Employee', 'View Departments', 'View Roles', 'View Employee', 'Update Employee Roles', 'Exit'],
    })
    .then((answer) => {
        switch (answer.start) {
            case 'Add Department':
                addDepartment();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'View Departments':
                viewDept();
                break;
            case 'View Roles':
                viewRoles();
                break;
            case 'View Employee':
                viewEmp();
                break;
            case 'Update Employee Role':
                updateEmp();
                break;
            default:
                exitProgram();
                break;
        }
    });
}
const addDepartment = () => {
    inquirer
    .prompt([
        {
            name: 'newDepartment',
            type: 'input',
            message: 'What is the department name?'
        },
    ])
    .then((answer) => {
        connection.query(
            'INSERT INTO department SET ?',
            { name: answer.newDepartment },
            (err) => {
                if (err) throw err;
                console.log(`${answer.newDepartment} has been added to Departments!`);
                pressAnyKey()
                .then(() => {
                    mainMenu();
                })
            }
        )
    });
}
const addRole = () => {
    connection.query('SELECT * FROM department', (err, results) => {
        if (err) throw err;    
        
        inquirer
        .prompt([
            {
                name: 'roleTitle',
                type: 'input',
                message: 'What is the title of the new role?'
            },
            {   
                name: 'salary',
                type: 'input',
                message: 'What is the salary of the new role?'
            },
            {
                name: 'department_id',
                type: 'rawlist',
                message: 'What department does this role belong to?',
                choices: () => {
                    const departments = [];
                    results.forEach(({ name, id }) => {
                        departments.push({ name: name, value: id });
                    });
                    return (departments);
                },
            },
        ])
        .then((answer) => {
            connection.query(
                'INSERT INTO role SET ?',
                {
                    title: answer.roleTitle,
                    salary: answer.salary,
                    department_id: answer.department_id,
                },
            (err) => {
                if (err) throw err;
                console.log(`${answer.roleTitle} had been added to Roles with a salary of ${answer.salary} per year.`);
                pressAnyKey()
                .then(() => {
                    mainMenu();
                })
            }
            );
        });
    })
}
const addEmployee = () => {
    connection.query('SELECT * FROM role', (err, results) => {
        if (err) throw err;
        inquirer
        .prompt ([
            {
                name: 'first_name',
                type: 'input',
                message: 'What is the employee\'s first name?'
            },
            {
                name: 'last_name',
                type: 'input',
                message: 'What is the employee\'s last name?'
            },
            {
                name: 'role_id',
                type: 'rawlist',
                message: 'What is the employee\'s role?',
                choices: () => {
                    const roleIDs = [];
                    results.forEach(({ title, id }) => {
                        roleIDs.push({ name: title, value: id });
                    });
                    return (roleIDs);
                },
            },
        ])
        .then ((answer) => {
            connection.query(
                'INSERT INTO employee SET ?',
                {
                    first_name: answer.first_name,
                    last_name: answer.last_name,
                    role_id: answer.role_id
                },
                (err) => {
                    if (err) throw err;
                    console.log(`${answer.first_name} ${answer.last_name} has been added to the list of employees.`);
                    pressAnyKey()
                    .then(() => {
                        mainMenu();
                    })
                }
            );
        });
    })
}
const viewDept = () => {
    connection.query('SELECT * FROM department', (err, results) => {
      if (err) throw err;
      console.table('DEPARTMENTS', results)
      pressAnyKey()
        .then(() => {
            mainMenu();
        })
    });
}
const viewRoles = () => {
    connection.query('SELECT * FROM role', (err, results) => {
      if (err) throw err;
      console.table('ROLES', results)
      pressAnyKey()
        .then(() => {
            mainMenu();
        })
    });
}
const viewEmp = () => {
    connection.query('SELECT * FROM employee', (err, results) => {
      if (err) throw err;
      console.table('EMPLOYEES', results)
      pressAnyKey()
        .then(() => {
            mainMenu();
        })
    });
}
const updateEmp = () => {
    connection.query('SELECT * FROM employee', (err, results) => {
        if (err) throw err;
        inquirer
        .prompt([
            {
                name: 'updateEmp',
                type:'rawlist',
                choices: () => {
                    const empRoles = [];
                    results.forEach(({ first_name, last_name, id }) => {
                        empRoles.push({ name: `${first_name} ${last_name}`, value: id })
                    })
                    return (empRoles);
                }
            }
        ])
        .then((answers) => {
            newRole(answers.updateEmp);
        });
    })
}
const newRole = (employee) => {
    connection.query('SELECT * FROM role', (err, results) => {
        if (err) throw err;
        inquirer
        .prompt([
            {
                name: 'newRole',
                type: 'rawlist',
                choices: () => {
                    const roleIDs = [];
                    results.forEach(({ id, title }) => {
                        roleIDs.push({ name: title, value: id })
                    })
                    return (roleIDs);
                }
            }
        ])
        .then((answers) => {
            connection.query(
              'UPDATE employee SET role_id=? WHERE id=?', 
              [answers.newRole, employee], (err, results) => {
                if (err) throw err;
                console.log(`Employee role has been updated.`)
                pressAnyKey()
                  .then(() => {
                    mainMenu();
                  }
                  )
              })
          })
    })
}
const exitProgram = () => {
    console.log('Good bye')
    connection.end();
}

connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);
    mainMenu();
})
