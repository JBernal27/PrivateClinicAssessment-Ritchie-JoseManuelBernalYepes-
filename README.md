
# Project Name: Clinic Appointment Scheduling

This project is designed for managing appointment scheduling in a private clinic. It uses NestJS for the backend and PostgreSQL as the database.

## Getting Started

### Prerequisites

1. Ensure you have **Node.js** and **npm** installed. You can check if you have them installed by running:
   ```bash
   node -v
   npm -v
   ```

2. Install **NestJS CLI** globally:
   ```bash
   npm i -g @nestjs/cli
   ```

3. Clone the repository:
   ```bash
   git clone https://github.com/your-username/clinic-appointment-scheduling.git
   cd clinic-appointment-scheduling
   ```

### Installing Dependencies

Run the following command to install the required dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file at the root of your project and add the following variables:



- `JWT_SECRET`: The secret key used for JWT authentication.
- `DATABASE_URL`: The connection string for your PostgreSQL database.

### Running the Application

After setting up your environment variables and installing the dependencies, you can start the application by running:

```bash
npm run start
```

## Usage, Documentation, and Important Points

To view the API documentation, open localhost:3000/api, which contains Swagger for easy interaction with the API endpoints.

Additionally, by connecting to localhost:3000 with Socket.IO and subscribing to the avaliableDoctors event, you can get a real-time list of available doctors.

This will start the application in development mode. The server will be available at `http://localhost:3000`.

### Database Diagram

Below is the database schema for the Clinic Appointment Scheduling system:

![Database Diagram](assets\privateClinicDiagram.png)

You can find the database schema in the `assests` folder.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
