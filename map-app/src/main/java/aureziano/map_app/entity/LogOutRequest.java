package aureziano.map_app.entity;

public class LogOutRequest {
    private Long userId;

    // Construtores
    public LogOutRequest() {
    }

    public LogOutRequest(Long userId) {
        this.userId = userId;
    }

    // Getters e Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
