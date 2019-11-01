package com.nationwide.shoppinglist.Entity;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name="list")

public class List {
	@Id
	@GeneratedValue
	private int id;
	private String item;
	private int quantity;
	private float price;
	private float total;
	private boolean purchased;
	
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public String getItem() {
		return item;
	}
	public void setItem(String item) {
		this.item = item;
	}
	public int getQuantity() {
		return quantity;
	}
	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}
	public float getPrice() {
		return price;
	}
	public void setPrice(float price) {
		this.price = price;
	}
	public float getTotal() {
		return total;
	}
	public void setTotal(float total) {
		this.total = total;
	}
	public boolean isPurchased() {
		return purchased;
	}
	
	public void setPurchased(boolean purchased) {
		this.purchased = purchased;
	}
	public void setAttributes(List updatedItem) {
		// TODO Auto-generated method stub
		
	}
}