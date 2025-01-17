package aureziano.map_app.entity;



@Entity
public class User {
    @Id
    @Generated(strategy = Generated.IDENTITY)
    private Long id;

    private String username;
    private String password;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> roles;

    // Getters, setters, constructors

}

