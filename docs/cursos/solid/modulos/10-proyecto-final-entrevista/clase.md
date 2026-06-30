---
sidebar_label: "Clase"
---

## API Biblioteca Legacy

```java
@SpringBootApplication
public class LibraryApplication { public static void main(String[] args) { SpringApplication.run(LibraryApplication.class, args); } }

@RestController
public class LibraryController {
    @Autowired private JdbcTemplate jdbc;

    @GetMapping("/books")
    public List<Map<String, Object>> getAllBooks() {
        return jdbc.queryForList("SELECT * FROM books");
    }

    @GetMapping("/books/{id}")
    public Map<String, Object> getBook(@PathVariable Long id) {
        return jdbc.queryForMap("SELECT * FROM books WHERE id = " + id);
    }

    @PostMapping("/books")
    public String createBook(@RequestBody Map<String, Object> body) {
        if (body.get("title") == null || body.get("title").toString().isEmpty()) return "Title required";
        if (body.get("author") == null) return "Author required";
        if (body.get("isbn") == null || body.get("isbn").toString().length() != 13) return "ISBN must be 13 chars";

        String sql = "INSERT INTO books (title, author, isbn, available) VALUES (?, ?, ?, true)";
        jdbc.update(sql, body.get("title"), body.get("author"), body.get("isbn"));
        return "Book created";
    }

    @PostMapping("/books/{id}/borrow")
    public String borrowBook(@PathVariable Long id, @RequestParam Long memberId) {
        Map<String, Object> book = jdbc.queryForMap("SELECT * FROM books WHERE id = " + id);
        if (!(boolean) book.get("available")) return "Book not available";

        Map<String, Object> member = jdbc.queryForMap("SELECT * FROM members WHERE id = " + memberId);
        if (member == null) return "Member not found";

        if ((int) jdbc.queryForObject("SELECT COUNT(*) FROM loans WHERE member_id = " + memberId + " AND return_date IS NULL", Integer.class) >= 5)
            return "Member has reached max loans";

        if (member.get("has_fines") != null && (boolean) member.get("has_fines"))
            return "Member has pending fines";

        jdbc.update("UPDATE books SET available = false WHERE id = " + id);
        jdbc.update("INSERT INTO loans (book_id, member_id, loan_date) VALUES (" + id + ", " + memberId + ", NOW())");
        return "Book borrowed";
    }

    @PostMapping("/books/{id}/return")
    public String returnBook(@PathVariable Long id) {
        Map<String, Object> loan = jdbc.queryForMap("SELECT * FROM loans WHERE book_id = " + id + " AND return_date IS NULL");
        if (loan == null) return "No active loan for this book";

        jdbc.update("UPDATE loans SET return_date = NOW() WHERE id = " + loan.get("id"));

        long daysLate = (System.currentTimeMillis() - ((java.sql.Timestamp) loan.get("due_date")).getTime()) / (1000 * 60 * 60 * 24);
        if (daysLate > 0) {
            double fine = daysLate * 1000;
            jdbc.update("UPDATE members SET total_fines = total_fines + " + fine + " WHERE id = " + loan.get("member_id"));
        }

        jdbc.update("UPDATE books SET available = true WHERE id = " + id);
        return "Book returned";
    }

    @GetMapping("/members/{id}/loans")
    public List<Map<String, Object>> getMemberLoans(@PathVariable Long id) {
        return jdbc.queryForList("SELECT * FROM loans WHERE member_id = " + id);
    }

    @GetMapping("/members")
    public List<Map<String, Object>> getAllMembers() { return jdbc.queryForList("SELECT * FROM members"); }

    @PostMapping("/members")
    public String createMember(@RequestBody Map<String, Object> body) {
        jdbc.update("INSERT INTO members (name, email, phone) VALUES (?, ?, ?)",
            body.get("name"), body.get("email"), body.get("phone"));
        return "Member created";
    }

    @GetMapping("/report")
    public String generateReport() {
        List<Map<String, Object>> books = jdbc.queryForList("SELECT * FROM books");
        List<Map<String, Object>> loans = jdbc.queryForList("SELECT * FROM loans WHERE return_date IS NULL");
        double totalFines = jdbc.queryForObject("SELECT COALESCE(SUM(total_fines), 0) FROM members", Double.class);

        StringBuilder report = new StringBuilder();
        report.append("<h1>Library Report</h1>");
        report.append("<p>Total books: ").append(books.size()).append("</p>");
        report.append("<p>Active loans: ").append(loans.size()).append("</p>");
        report.append("<p>Total fines: $").append(totalFines).append("</p>");
        return report.toString();
    }
}
```

### Violaciones Identificables

- **SRP:** Un solo controller maneja libros, miembros, préstamos, multas y reportes
- **OCP:** No hay estrategias extensibles (calculos de multas fijos, sin tipos de membresía)
- **LSP:** No hay interfaces ni polimorfismo (todo depende de Map<String, Object>)
- **ISP:** Controller monolítico que expone 10+ endpoints no relacionados
- **DIP:** JdbcTemplate directo, SQL embebido, SQL Injection en todas partes
- **Seguridad:** SQL Injection en cada endpoint con concatenación de strings
